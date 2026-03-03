import random
import time
import tkinter as tk
from tkinter import messagebox, ttk
import importlib.util
import os
import threading
import multiprocessing as mp
import gc

import lqft_engine
try:
    import psutil
except ImportError:  # pragma: no cover
    psutil = None


def _memory_density_worker(benchmark_path, structure_name, n, queue):
    try:
        if psutil is None:
            queue.put({"structure": structure_name, "error": "psutil not installed"})
            return
        spec = importlib.util.spec_from_file_location("bench_mem_mod", benchmark_path)
        if spec is None or spec.loader is None:
            queue.put({"structure": structure_name, "error": "benchmark module load failed"})
            return
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        target = None
        for s in mod.build_structure_list():
            if getattr(s, "name", "") == structure_name:
                target = s
                break
        if target is None:
            queue.put({"structure": structure_name, "error": "structure not found"})
            return

        proc = psutil.Process(os.getpid())
        gc.collect()
        start_mb = proc.memory_info().rss / (1024 * 1024)
        for i in range(n):
            target.insert(f"mem-{i}", f"v-{i % 64}")
        end_mb = proc.memory_info().rss / (1024 * 1024)
        if hasattr(target, "finalize"):
            target.finalize()
        delta = max(0.0, end_mb - start_mb)
        bpi = (delta * 1024 * 1024 / n) if n else 0.0
        queue.put(
            {
                "structure": structure_name,
                "rss_start_mb": round(start_mb, 3),
                "rss_end_mb": round(end_mb, 3),
                "delta_mb": round(delta, 3),
                "bytes_per_item": round(bpi, 2),
            }
        )
    except Exception as exc:  # pragma: no cover
        queue.put({"structure": structure_name, "error": str(exc)})


# Glassmorphism theme: frosted glass surfaces, soft borders, layered depth
THEME = {
    "bg": "#a8bdd4",           # soft blue-gray base (glass backdrop)
    "bg_top": "#9aafc8",        # slightly darker for gradient feel
    "glass": "#e0e8f2",        # frosted panel (main)
    "glass_light": "#e8eef6",   # lighter frosted
    "glass_border": "#ffffff",  # glass edge highlight
    "glass_border_soft": "#c8d4e4",
    "surface": "#e4eaf4",       # card / content area
    "surface_alt": "#dce4f0",
    "border": "#b8c8dc",
    "primary": "#5b6ee8",       # soft indigo
    "primary_hover": "#6b7cf2",
    "accent": "#e9a23b",        # warm amber for LQFT
    "accent_light": "#fef6e8",  # frosted amber tint
    "text": "#1a2332",
    "text_muted": "#5c6b7e",
    "font_family": "Segoe UI",
    "font_size": 10,
    "font_size_small": 9,
}


class LQFTDemoApp:
    TREE_STRUCTURES = {
        "adaptive_lqft_light",
        "adaptive_lqft_native",
        "lqft_persistent_tree",
        "bst_unbalanced",
        "avl_tree",
        "treap_tree",
        "trie_map",
        "sqlite_in_memory",
        "sorted_dict",
    }
    MEMORY_RANK = {
        "sqlite_in_memory": 1.0,
        "sorted_list_bisect": 2.0,
        "dict": 3.5,
        "defaultdict_map": 3.8,
        "set_index": 3.2,
        "sorted_dict": 6.5,
        "shelve_map": 11.5,
        "adaptive_lqft_light": 3.5,
        "bst_unbalanced": 5.0,
        "avl_tree": 6.0,
        "ordered_dict": 7.0,
        "list_linear_map": 8.0,
        "trie_map": 9.0,
        "treap_tree": 10.0,
        "lqft_persistent_tree": 11.0,
        "adaptive_lqft_native": 12.0,
    }

    COMPLEXITY_RANK = {
        "avl_tree": 1.5,
        "sqlite_in_memory": 2.0,
        "set_index": 2.5,
        "sorted_dict": 2.2,
        "trie_map": 2.5,
        "dict": 3.0,
        "defaultdict_map": 3.0,
        "ordered_dict": 3.0,
        "adaptive_lqft_light": 3.0,
        "adaptive_lqft_native": 4.0,
        "shelve_map": 4.5,
        "treap_tree": 5.0,
        "lqft_persistent_tree": 6.0,
        "sorted_list_bisect": 8.0,
        "bst_unbalanced": 9.0,
        "list_linear_map": 10.0,
    }
    BASE_PERF_RANK = {
        "dict": 1.00,
        "set_index": 1.70,
        "defaultdict_map": 2.30,
        "sorted_dict": 5.20,
        "shelve_map": 11.50,
        "ordered_dict": 2.00,
        "adaptive_lqft_light": 3.25,
        "trie_map": 3.75,
        "sorted_list_bisect": 5.75,
        "bst_unbalanced": 6.00,
        "treap_tree": 7.75,
        "avl_tree": 8.75,
        "adaptive_lqft_native": 9.25,
        "sqlite_in_memory": 9.50,
        "list_linear_map": 10.25,
        "lqft_persistent_tree": 10.33,
    }

    def __init__(self, root):
        self.root = root
        self.root.title("LQFT Demonstration App")
        self.root.geometry("1000x720")
        self.root.minsize(320, 400)
        self.root.configure(bg=THEME["bg"])

        self.mode_var = tk.StringVar(value="adaptive_light")
        self.key_var = tk.StringVar()
        self.value_var = tk.StringVar()
        self.status_var = tk.StringVar(value="Ready")
        self.compare_n_var = tk.StringVar(value="3000")
        self.compare_timer_var = tk.StringVar(value="Timer: 00:00")
        self.compare_state_var = tk.StringVar(value="Idle")
        self.memory_n_var = tk.StringVar(value="3000")
        self.graph_metric_var = tk.StringVar(value="complexity_rank")
        self.compare_running = False
        self.memory_running = False

        self.engine = None
        self.inserted_keys = []
        self.compare_rows = []
        self.last_benchmark_result = "No benchmark run yet."
        self.last_complexity_scored = []
        self.memory_rows = []

        self._build_ui()
        self._reset_engine()

    def _setup_theme(self):
        try:
            style = ttk.Style(self.root)
            if "clam" in style.theme_names():
                style.theme_use("clam")
            font = (THEME["font_family"], THEME["font_size"])
            font_small = (THEME["font_family"], THEME["font_size_small"])
            style.configure(".", background=THEME["bg"], foreground=THEME["text"], font=font)
            style.configure("TFrame", background=THEME["bg"])
            style.configure(
                "TLabel",
                background=THEME["bg"],
                foreground=THEME["text"],
                font=font,
            )
            style.configure(
                "TLabelframe",
                background=THEME["glass"],
                foreground=THEME["text"],
                font=font,
            )
            style.configure("TLabelframe.Label", background=THEME["glass"], foreground=THEME["text"], font=font)
            # Glass-style buttons: frosted with primary tint
            style.configure(
                "TButton",
                font=font,
                padding=(14, 10),
                background=THEME["glass_light"],
                foreground=THEME["text"],
            )
            style.map(
                "TButton",
                background=[
                    ("active", THEME["primary"]),
                    ("pressed", THEME["primary_hover"]),
                    ("disabled", THEME["glass_border_soft"]),
                ],
                foreground=[
                    ("active", "#ffffff"),
                    ("pressed", "#ffffff"),
                    ("disabled", THEME["text_muted"])],
            )
            style.configure("TNotebook", background=THEME["bg"])
            style.configure(
                "TNotebook.Tab",
                padding=(14, 8),
                font=font,
                background=THEME["glass_border_soft"],
            )
            style.map(
                "TNotebook.Tab",
                background=[("selected", THEME["glass_light"]), ("active", THEME["glass"])],
                expand=[("selected", [1, 1, 1, 0])],
            )
            style.configure(
                "TEntry",
                fieldbackground=THEME["glass_light"],
                foreground=THEME["text"],
                padding=6,
            )
            style.configure(
                "TCombobox",
                fieldbackground=THEME["glass_light"],
                foreground=THEME["text"],
                padding=6,
            )
            style.configure(
                "Treeview",
                background=THEME["glass_light"],
                foreground=THEME["text"],
                fieldbackground=THEME["glass_light"],
                font=font_small,
                rowheight=22,
            )
            style.configure("Treeview.Heading", font=font, background=THEME["glass"], foreground=THEME["text"])
            style.map("Treeview", background=[("selected", THEME["primary"])], foreground=[("selected", "#ffffff")])
            style.configure("Vertical.TScrollbar", background=THEME["glass_border_soft"])
            style.configure("Horizontal.TScrollbar", background=THEME["glass_border_soft"])
            style.configure("TProgressbar", background=THEME["primary"], troughcolor=THEME["glass_border_soft"], thickness=8)
            style.configure("Card.TFrame", background=THEME["glass_light"])
            style.configure("TopBar.TFrame", background=THEME["bg_top"])
        except Exception:
            pass

    def _build_ui(self):
        self._setup_theme()
        # Toolbar 1: engine and quick actions (grid for responsive reflow)
        top = ttk.Frame(self.root, padding=(12, 10), style="TopBar.TFrame")
        top.pack(fill=tk.X)
        top.columnconfigure(1, weight=1)
        ttk.Label(top, text="Engine Mode:").grid(row=0, column=0, sticky=tk.W, padx=(0, 6))
        mode = ttk.Combobox(
            top,
            textvariable=self.mode_var,
            state="readonly",
            width=16,
            values=["adaptive_light", "adaptive_native", "persistent"],
        )
        mode.grid(row=0, column=1, sticky=tk.W, padx=(0, 10))
        mode.bind("<<ComboboxSelected>>", lambda _e: self._reset_engine())
        ttk.Button(top, text="Reset", command=self._reset_engine).grid(row=0, column=2, padx=4)
        ttk.Button(top, text="Load 10k", command=self._load_samples).grid(row=0, column=3, padx=4)
        ttk.Button(top, text="Mini Benchmark", command=self._mini_benchmark).grid(row=0, column=4, padx=4)

        top2 = ttk.Frame(self.root, padding=(12, 6, 12, 10))
        top2.pack(fill=tk.X)
        top2.columnconfigure(1, weight=1)
        ttk.Label(top2, text="Compare N:").grid(row=0, column=0, sticky=tk.W, padx=(0, 4))
        ttk.Entry(top2, textvariable=self.compare_n_var, width=6).grid(row=0, column=1, sticky=tk.W, padx=(0, 8))
        self.compare_btn = ttk.Button(top2, text="Run Comparison", command=self._start_full_comparison)
        self.compare_btn.grid(row=0, column=2, padx=4)
        ttk.Label(top2, text="Memory N:").grid(row=0, column=3, sticky=tk.W, padx=(12, 4))
        ttk.Entry(top2, textvariable=self.memory_n_var, width=6).grid(row=0, column=4, sticky=tk.W, padx=(0, 8))
        self.memory_btn = ttk.Button(top2, text="Memory Density", command=self._start_memory_density)
        self.memory_btn.grid(row=0, column=5, padx=4)
        ttk.Label(top2, textvariable=self.compare_timer_var).grid(row=0, column=6, padx=(8, 0))
        ttk.Label(top2, textvariable=self.compare_state_var).grid(row=0, column=7, padx=(4, 0))
        self.compare_progress = ttk.Progressbar(top2, orient=tk.HORIZONTAL, mode="indeterminate", length=160)
        self.compare_progress.grid(row=0, column=8, padx=(8, 0))

        # CRUD in a glass panel (wrap for glass border)
        form_outer = tk.Frame(self.root, bg=THEME["glass_border"], padx=1, pady=1)
        form_outer.pack(fill=tk.X, padx=16, pady=(0, 10))
        form = ttk.LabelFrame(form_outer, text="  CRUD Playground  ", padding=14)
        form.pack(fill=tk.X)
        form.columnconfigure(1, weight=1)
        form.columnconfigure(3, weight=1)
        ttk.Label(form, text="Key").grid(row=0, column=0, sticky=tk.W, padx=(0, 8))
        ttk.Entry(form, textvariable=self.key_var, width=28).grid(row=0, column=1, sticky=tk.EW)
        ttk.Label(form, text="Value").grid(row=1, column=0, sticky=tk.W, padx=(0, 8), pady=(10, 0))
        ttk.Entry(form, textvariable=self.value_var, width=28).grid(row=1, column=1, sticky=tk.EW)
        btns = ttk.Frame(form)
        btns.grid(row=2, column=0, columnspan=2, sticky=tk.W, pady=(14, 0))
        ttk.Button(btns, text="Insert", command=self._insert).pack(side=tk.LEFT, padx=(0, 8))
        ttk.Button(btns, text="Search", command=self._search).pack(side=tk.LEFT, padx=(0, 8))
        ttk.Button(btns, text="Delete", command=self._delete).pack(side=tk.LEFT, padx=(0, 8))
        ttk.Button(btns, text="Purge / Clear", command=self._purge).pack(side=tk.LEFT, padx=(0, 8))

        # Notebook in a glass-style container (thin border)
        notebook_outer = tk.Frame(self.root, bg=THEME["glass_border_soft"], padx=1, pady=1)
        notebook_outer.pack(fill=tk.BOTH, expand=True, padx=16, pady=(0, 10))
        notebook_wrap = ttk.Frame(notebook_outer, padding=(0, 0, 0, 0))
        notebook_wrap.pack(fill=tk.BOTH, expand=True)
        self.tabs = ttk.Notebook(notebook_wrap)
        self.tabs.pack(fill=tk.BOTH, expand=True)

        snapshot_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        log_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        rank_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        complexity_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        tree_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        complexity_graph_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        memory_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        tree_memory_tab = ttk.Frame(self.tabs, padding=12, style="Card.TFrame")
        self.tabs.add(snapshot_tab, text="Snapshot")
        self.tabs.add(log_tab, text="Log")
        self.tabs.add(rank_tab, text="Ranking")
        self.tabs.add(complexity_tab, text="Complexity")
        self.tabs.add(tree_tab, text="Tree Comparison")
        self.tabs.add(complexity_graph_tab, text="Complexity Graph")
        self.tabs.add(memory_tab, text="Memory Density")
        self.tabs.add(tree_memory_tab, text="Tree Memory Density")

        font_text = (THEME["font_family"], THEME["font_size"])
        self.snapshot = tk.Text(
            snapshot_tab,
            height=20,
            wrap=tk.WORD,
            font=font_text,
            bg=THEME["surface"],
            fg=THEME["text"],
            insertbackground=THEME["text"],
            selectbackground=THEME["primary"],
            selectforeground="#ffffff",
            relief=tk.FLAT,
            padx=10,
            pady=10,
        )
        self.snapshot.pack(fill=tk.BOTH, expand=True)
        self.log = tk.Text(
            log_tab,
            height=20,
            wrap=tk.WORD,
            font=font_text,
            bg=THEME["surface_alt"],
            fg=THEME["text"],
            insertbackground=THEME["text"],
            selectbackground=THEME["primary"],
            selectforeground="#ffffff",
            relief=tk.FLAT,
            padx=10,
            pady=10,
        )
        self.log.pack(fill=tk.BOTH, expand=True)

        cols = (
            "rank",
            "structure",
            "insert_rank",
            "hit_rank",
            "miss_rank",
            "delete_rank",
            "perf_rank",
            "memory_rank",
            "complexity_rank",
            "total_score",
        )
        self.rank_tree = ttk.Treeview(rank_tab, columns=cols, show="headings", height=18)
        for c, w in [
            ("rank", 55),
            ("structure", 190),
            ("insert_rank", 95),
            ("hit_rank", 95),
            ("miss_rank", 95),
            ("delete_rank", 95),
            ("perf_rank", 85),
            ("memory_rank", 95),
            ("complexity_rank", 110),
            ("total_score", 95),
        ]:
            self.rank_tree.heading(c, text=c)
            self.rank_tree.column(c, width=w, anchor=tk.CENTER)
        rank_scroll_y = ttk.Scrollbar(rank_tab, orient=tk.VERTICAL, command=self.rank_tree.yview)
        rank_scroll_x = ttk.Scrollbar(rank_tab, orient=tk.HORIZONTAL, command=self.rank_tree.xview)
        self.rank_tree.configure(yscrollcommand=rank_scroll_y.set, xscrollcommand=rank_scroll_x.set)
        self.rank_tree.tag_configure("lqft", background=THEME["accent_light"])
        self.rank_tree.pack(fill=tk.BOTH, expand=True, side=tk.TOP)
        rank_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        rank_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)

        ccols = (
            "overall_rank",
            "structure",
            "insert",
            "search",
            "delete",
            "worst_case",
            "space",
            "perf_rank",
            "memory_rank",
            "complexity_rank",
            "total_score",
        )
        self.complexity_tree = ttk.Treeview(complexity_tab, columns=ccols, show="headings", height=18)
        for c, w in [
            ("overall_rank", 85),
            ("structure", 220),
            ("insert", 120),
            ("search", 120),
            ("delete", 120),
            ("worst_case", 160),
            ("space", 220),
            ("perf_rank", 90),
            ("memory_rank", 95),
            ("complexity_rank", 110),
            ("total_score", 95),
        ]:
            self.complexity_tree.heading(c, text=c)
            self.complexity_tree.column(c, width=w, anchor=tk.CENTER)
        comp_scroll_y = ttk.Scrollbar(complexity_tab, orient=tk.VERTICAL, command=self.complexity_tree.yview)
        comp_scroll_x = ttk.Scrollbar(complexity_tab, orient=tk.HORIZONTAL, command=self.complexity_tree.xview)
        self.complexity_tree.configure(yscrollcommand=comp_scroll_y.set, xscrollcommand=comp_scroll_x.set)
        self.complexity_tree.tag_configure("lqft", background=THEME["accent_light"])
        self.complexity_tree.pack(fill=tk.BOTH, expand=True, side=tk.TOP)
        comp_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        comp_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        ttk.Label(
            complexity_tab,
            text="Complexities are high-level theoretical classes (average-case unless noted).",
        ).pack(anchor=tk.W, pady=(8, 0))
        self._populate_complexity_table()

        graph_wrap = ttk.Frame(complexity_graph_tab)
        graph_wrap.pack(fill=tk.BOTH, expand=True)
        graph_controls = ttk.Frame(complexity_graph_tab)
        graph_controls.pack(fill=tk.X, pady=(0, 6))
        ttk.Label(graph_controls, text="Graph Metric:").pack(side=tk.LEFT)
        graph_metric = ttk.Combobox(
            graph_controls,
            textvariable=self.graph_metric_var,
            state="readonly",
            width=20,
            values=["complexity_rank", "total_score"],
        )
        graph_metric.pack(side=tk.LEFT, padx=(6, 8))
        graph_metric.bind("<<ComboboxSelected>>", lambda _e: self._draw_complexity_graph())
        self.complexity_graph_canvas = tk.Canvas(
            graph_wrap,
            bg=THEME["glass_light"],
            highlightthickness=0,
        )
        graph_scroll_y = ttk.Scrollbar(graph_wrap, orient=tk.VERTICAL, command=self.complexity_graph_canvas.yview)
        graph_scroll_x = ttk.Scrollbar(graph_wrap, orient=tk.HORIZONTAL, command=self.complexity_graph_canvas.xview)
        self.complexity_graph_canvas.configure(yscrollcommand=graph_scroll_y.set, xscrollcommand=graph_scroll_x.set)
        self.complexity_graph_canvas.bind("<Configure>", self._draw_complexity_graph)
        self.complexity_graph_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        graph_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        graph_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        ttk.Label(
            complexity_graph_tab,
            text="Graph uses complexity rank (lower is better): shorter bars indicate better theoretical complexity rank.",
        ).pack(anchor=tk.W, pady=(6, 0))

        tcols = (
            "rank",
            "structure",
            "insert_rank",
            "hit_rank",
            "miss_rank",
            "delete_rank",
            "perf_rank",
            "memory_rank",
            "complexity_rank",
            "total_score",
        )
        self.tree_rank_tree = ttk.Treeview(tree_tab, columns=tcols, show="headings", height=18)
        for c, w in [
            ("rank", 55),
            ("structure", 190),
            ("insert_rank", 95),
            ("hit_rank", 95),
            ("miss_rank", 95),
            ("delete_rank", 95),
            ("perf_rank", 85),
            ("memory_rank", 95),
            ("complexity_rank", 110),
            ("total_score", 95),
        ]:
            self.tree_rank_tree.heading(c, text=c)
            self.tree_rank_tree.column(c, width=w, anchor=tk.CENTER)
        tree_scroll_y = ttk.Scrollbar(tree_tab, orient=tk.VERTICAL, command=self.tree_rank_tree.yview)
        tree_scroll_x = ttk.Scrollbar(tree_tab, orient=tk.HORIZONTAL, command=self.tree_rank_tree.xview)
        self.tree_rank_tree.configure(yscrollcommand=tree_scroll_y.set, xscrollcommand=tree_scroll_x.set)
        self.tree_rank_tree.tag_configure("lqft", background=THEME["accent_light"])
        self.tree_rank_tree.pack(fill=tk.BOTH, expand=True, side=tk.TOP)
        tree_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        tree_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)

        mcols = ("rank", "structure", "delta_mb", "bytes_per_item", "rss_start_mb", "rss_end_mb", "status")
        self.memory_tree = ttk.Treeview(memory_tab, columns=mcols, show="headings", height=18)
        for c, w in [
            ("rank", 55),
            ("structure", 200),
            ("delta_mb", 110),
            ("bytes_per_item", 120),
            ("rss_start_mb", 120),
            ("rss_end_mb", 120),
            ("status", 250),
        ]:
            self.memory_tree.heading(c, text=c)
            self.memory_tree.column(c, width=w, anchor=tk.CENTER)
        mem_scroll_y = ttk.Scrollbar(memory_tab, orient=tk.VERTICAL, command=self.memory_tree.yview)
        mem_scroll_x = ttk.Scrollbar(memory_tab, orient=tk.HORIZONTAL, command=self.memory_tree.xview)
        self.memory_tree.configure(yscrollcommand=mem_scroll_y.set, xscrollcommand=mem_scroll_x.set)
        self.memory_tree.tag_configure("lqft", background=THEME["accent_light"])
        self.memory_tree.pack(fill=tk.BOTH, expand=True, side=tk.TOP)
        mem_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        mem_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        ttk.Label(
            memory_tab,
            text="Run Memory Density to calculate per-structure memory deltas in isolated subprocesses.",
        ).pack(anchor=tk.W, pady=(8, 0))

        tm_cols = ("rank", "structure", "delta_mb", "bytes_per_item", "rss_start_mb", "rss_end_mb", "status")
        self.tree_memory_tree = ttk.Treeview(tree_memory_tab, columns=tm_cols, show="headings", height=18)
        for c, w in [
            ("rank", 55),
            ("structure", 200),
            ("delta_mb", 110),
            ("bytes_per_item", 120),
            ("rss_start_mb", 120),
            ("rss_end_mb", 120),
            ("status", 250),
        ]:
            self.tree_memory_tree.heading(c, text=c)
            self.tree_memory_tree.column(c, width=w, anchor=tk.CENTER)
        tm_scroll_y = ttk.Scrollbar(tree_memory_tab, orient=tk.VERTICAL, command=self.tree_memory_tree.yview)
        tm_scroll_x = ttk.Scrollbar(tree_memory_tab, orient=tk.HORIZONTAL, command=self.tree_memory_tree.xview)
        self.tree_memory_tree.configure(yscrollcommand=tm_scroll_y.set, xscrollcommand=tm_scroll_x.set)
        self.tree_memory_tree.tag_configure("lqft", background=THEME["accent_light"])
        self.tree_memory_tree.pack(fill=tk.BOTH, expand=True, side=tk.TOP)
        tm_scroll_y.pack(side=tk.RIGHT, fill=tk.Y)
        tm_scroll_x.pack(side=tk.BOTTOM, fill=tk.X)
        ttk.Label(
            tree_memory_tab,
            text="Tree-only view of memory density results.",
        ).pack(anchor=tk.W, pady=(8, 0))

        # Glass status bar with top highlight
        bottom = tk.Frame(self.root, bg=THEME["glass_border"], height=1)
        bottom.pack(fill=tk.X)
        bottom.pack_propagate(False)
        status_inner = tk.Frame(self.root, bg=THEME["glass"], height=32)
        status_inner.pack(fill=tk.X)
        status_inner.pack_propagate(False)
        status_lbl = tk.Label(
            status_inner,
            textvariable=self.status_var,
            bg=THEME["glass"],
            fg=THEME["text_muted"],
            font=(THEME["font_family"], THEME["font_size_small"]),
            anchor=tk.W,
        )
        status_lbl.pack(side=tk.LEFT, padx=16, pady=6, fill=tk.X, expand=True)

    def _make_engine(self):
        mode = self.mode_var.get()
        if mode == "persistent":
            return lqft_engine.LQFT()
        if mode == "adaptive_native":
            return lqft_engine.AdaptiveLQFT(migration_threshold=500)
        return lqft_engine.AdaptiveLQFT(migration_threshold=10**9)

    def _reset_engine(self):
        self.engine = self._make_engine()
        self.inserted_keys = []
        self._log(f"Engine reset to mode={self.mode_var.get()}")
        self.status_var.set(f"Mode: {self.mode_var.get()} (fresh instance)")
        self._refresh_snapshot()

    def _insert(self):
        key = self.key_var.get().strip()
        value = self.value_var.get()
        if not key:
            messagebox.showwarning("Missing key", "Please enter a key.")
            return
        try:
            self.engine.insert(key, value)
            self.inserted_keys.append(key)
            self.status_var.set(f"Inserted key={key}")
            self._log(f"insert({key!r}, {value!r})")
            self._refresh_snapshot()
        except Exception as exc:
            self._log(f"Insert error: {exc}")
            messagebox.showerror("Insert failed", str(exc))

    def _search(self):
        key = self.key_var.get().strip()
        if not key:
            messagebox.showwarning("Missing key", "Please enter a key.")
            return
        try:
            value = self.engine.search(key)
            self.status_var.set(f"search({key}) -> {value!r}")
            self._log(f"search({key!r}) -> {value!r}")
        except Exception as exc:
            self._log(f"Search error: {exc}")
            messagebox.showerror("Search failed", str(exc))

    def _delete(self):
        key = self.key_var.get().strip()
        if not key:
            messagebox.showwarning("Missing key", "Please enter a key.")
            return
        if not hasattr(self.engine, "delete"):
            messagebox.showinfo("Unsupported", "Delete is not available on persistent LQFT class.")
            return
        try:
            self.engine.delete(key)
            self.status_var.set(f"Deleted key={key}")
            self._log(f"delete({key!r})")
            self._refresh_snapshot()
        except Exception as exc:
            self._log(f"Delete error: {exc}")
            messagebox.showerror("Delete failed", str(exc))

    def _purge(self):
        try:
            if hasattr(self.engine, "purge"):
                self.engine.purge()
                self._log("purge()")
            elif hasattr(self.engine, "clear"):
                self.engine.clear()
                self._log("clear()")
            self.status_var.set("Purged / Cleared")
            self._refresh_snapshot()
        except Exception as exc:
            self._log(f"Purge/Clear error: {exc}")
            messagebox.showerror("Purge/Clear failed", str(exc))

    def _load_samples(self):
        try:
            for i in range(10000):
                key = f"user-{i}"
                value = f"score-{random.randint(1, 999)}"
                self.engine.insert(key, value)
                self.inserted_keys.append(key)
            self._log("Loaded 10,000 sample keys.")
            self.status_var.set("Loaded 10,000 samples")
            self._refresh_snapshot()
        except Exception as exc:
            self._log(f"Load sample error: {exc}")
            messagebox.showerror("Load sample failed", str(exc))

    def _mini_benchmark(self):
        n = 20000
        keys = [f"bench-{i}" for i in range(n)]
        vals = [f"v-{i}" for i in range(n)]

        # reset local benchmark instance of same mode for fair run
        bench_engine = self._make_engine()

        t0 = time.perf_counter()
        for i in range(n):
            bench_engine.insert(keys[i], vals[i])
        insert_s = time.perf_counter() - t0

        t1 = time.perf_counter()
        for i in range(n):
            bench_engine.search(keys[i])
        hit_s = time.perf_counter() - t1

        if hasattr(bench_engine, "delete"):
            t2 = time.perf_counter()
            for i in range(n // 2):
                bench_engine.delete(keys[i])
            delete_s = time.perf_counter() - t2
            delete_msg = f"delete_half={((n//2)/delete_s):,.0f} ops/s"
        else:
            delete_msg = "delete_half=N/A"

        insert_tps = n / insert_s if insert_s else 0.0
        hit_tps = n / hit_s if hit_s else 0.0
        msg = (
            f"Mini benchmark ({self.mode_var.get()}): "
            f"insert={insert_tps:,.0f} ops/s, "
            f"search_hits={hit_tps:,.0f} ops/s, "
            f"{delete_msg}"
        )
        self.last_benchmark_result = msg
        self._log(msg)
        self.status_var.set("Mini benchmark completed")
        self._refresh_snapshot()
        self.tabs.select(1)
        messagebox.showinfo("Mini benchmark result", msg)

    def _load_benchmark_module(self):
        path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "0.3.0", "benchmark_comparison.py")
        )
        spec = importlib.util.spec_from_file_location("benchmark_comparison_runtime", path)
        if spec is None or spec.loader is None:
            raise RuntimeError("Unable to load benchmark_comparison.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod

    def _start_full_comparison(self):
        if self.compare_running:
            return
        try:
            compare_n = int(self.compare_n_var.get().strip())
            if compare_n <= 0:
                raise ValueError()
        except ValueError:
            messagebox.showwarning("Invalid N", "Compare N must be a positive integer.")
            return
        self.compare_running = True
        self.compare_btn.configure(state=tk.DISABLED)
        self.compare_state_var.set("Running comparison...")
        self.compare_progress.start(10)
        self.compare_n_current = compare_n
        self.status_var.set(f"Running comparison (N={compare_n})... please wait")
        self._log(
            f"Starting comparison (N={compare_n}, all major structures). "
            "Note: N=10000 can take several minutes."
        )
        self.compare_started_at = time.perf_counter()
        self._pulse_compare_status()
        t = threading.Thread(target=self._run_full_comparison_worker, daemon=True)
        t.start()

    def _run_full_comparison_worker(self):
        try:
            mod = self._load_benchmark_module()
            results = mod.run_suite_once(dataset_size=self.compare_n_current, sample_every=200, seed=1337)
            rows = [mod.as_dict(r) for r in results]
            ranking = self._build_ranking(rows)
            self.root.after(0, lambda: self._apply_ranking(ranking, rows))
        except Exception as exc:
            self.root.after(0, lambda: self._comparison_failed(exc))

    def _format_elapsed(self, seconds):
        s = int(max(0, seconds))
        mm = s // 60
        ss = s % 60
        return f"{mm:02d}:{ss:02d}"

    def _pulse_compare_status(self):
        if not self.compare_running:
            return
        elapsed = time.perf_counter() - self.compare_started_at
        self.compare_timer_var.set(f"Timer: {self._format_elapsed(elapsed)}")
        self.status_var.set(f"Running comparison (N={self.compare_n_current})... {elapsed:.0f}s elapsed")
        self.root.after(1000, self._pulse_compare_status)

    def _comparison_failed(self, exc):
        self.compare_running = False
        self.compare_btn.configure(state=tk.NORMAL)
        self.compare_state_var.set("Comparison failed")
        self.compare_progress.stop()
        self._log(f"Comparison failed: {exc}")
        self.status_var.set("Comparison failed")
        self.compare_timer_var.set("Timer: 00:00")
        messagebox.showerror("Comparison failed", str(exc))

    def _row_tags(self, structure):
        s = (structure or "").lower()
        if "lqft" in s:
            return ("lqft",)
        return ()

    def _build_ranking(self, rows):
        ops = ["insert", "search_hits", "search_misses", "delete_half"]
        per_op = {op: [] for op in ops}
        for r in rows:
            op = r["operation"]
            if op in per_op:
                per_op[op].append((r["structure"], r["throughput_ops_s"]))
        rank_maps = {}
        for op in ops:
            sorted_rows = sorted(per_op[op], key=lambda x: x[1], reverse=True)
            rank_maps[op] = {name: i + 1 for i, (name, _tps) in enumerate(sorted_rows)}

        structures = sorted({r["structure"] for r in rows if r["operation"] in ops})
        ranking = []
        for s in structures:
            ranks = [rank_maps[op][s] for op in ops if s in rank_maps[op]]
            if not ranks:
                continue
            avg_rank = sum(ranks) / len(ranks)
            ranking.append(
                {
                    "structure": s,
                    "insert_rank": rank_maps["insert"].get(s, "-"),
                    "hit_rank": rank_maps["search_hits"].get(s, "-"),
                    "miss_rank": rank_maps["search_misses"].get(s, "-"),
                    "delete_rank": rank_maps["delete_half"].get(s, "-"),
                    "perf_rank": avg_rank,
                }
            )
        for row in ranking:
            mem_rank = self.MEMORY_RANK.get(row["structure"], 99.0)
            cmp_rank = self.COMPLEXITY_RANK.get(row["structure"], 99.0)
            total = 0.5 * row["perf_rank"] + 0.3 * mem_rank + 0.2 * cmp_rank
            row["memory_rank"] = mem_rank
            row["complexity_rank"] = cmp_rank
            row["total_score"] = total

        # Overall ranking order (V2-style): lower total score is better.
        ranking.sort(key=lambda x: x["total_score"])
        return ranking

    def _apply_ranking(self, ranking, rows):
        self.compare_running = False
        self.compare_btn.configure(state=tk.NORMAL)
        self.compare_state_var.set("Comparison complete")
        self.compare_progress.stop()
        for item in self.rank_tree.get_children():
            self.rank_tree.delete(item)
        if not ranking:
            self._log("Comparison produced no ranking rows.")
            self.status_var.set("Comparison finished but no ranking rows were generated")
            messagebox.showwarning("No ranking rows", "Comparison finished, but no ranking rows were generated.")
            return
        for i, r in enumerate(ranking, 1):
            self.rank_tree.insert(
                "",
                tk.END,
                tags=self._row_tags(r["structure"]),
                values=(
                    i,
                    r["structure"],
                    r["insert_rank"],
                    r["hit_rank"],
                    r["miss_rank"],
                    r["delete_rank"],
                    f"{r['perf_rank']:.2f}",
                    f"{r['memory_rank']:.2f}",
                    f"{r['complexity_rank']:.2f}",
                    f"{r['total_score']:.2f}",
                ),
            )
        self._apply_tree_ranking(ranking)
        top3 = ", ".join([f"{i+1}) {r['structure']} ({r['total_score']:.2f})" for i, r in enumerate(ranking[:3])])
        elapsed = time.perf_counter() - getattr(self, "compare_started_at", time.perf_counter())
        self._log(f"Comparison done in {elapsed:.2f}s. Top 3 overall: {top3}")
        self.status_var.set("Full 10k comparison completed")
        self.compare_timer_var.set(f"Timer: {self._format_elapsed(elapsed)}")
        perf_map = {r["structure"]: r["perf_rank"] for r in ranking}
        self._populate_complexity_table(perf_map=perf_map)
        self.tabs.select(2)
        messagebox.showinfo("Comparison complete", f"Ranking updated.\nTop 3: {top3}")

    def _apply_tree_ranking(self, ranking):
        for item in self.tree_rank_tree.get_children():
            self.tree_rank_tree.delete(item)

        tree_rows = [r for r in ranking if r["structure"] in self.TREE_STRUCTURES]
        if not tree_rows:
            return
        for i, r in enumerate(tree_rows, 1):
            self.tree_rank_tree.insert(
                "",
                tk.END,
                tags=self._row_tags(r["structure"]),
                values=(
                    i,
                    r["structure"],
                    r["insert_rank"],
                    r["hit_rank"],
                    r["miss_rank"],
                    r["delete_rank"],
                    f"{r['perf_rank']:.2f}",
                    f"{r['memory_rank']:.2f}",
                    f"{r['complexity_rank']:.2f}",
                    f"{r['total_score']:.2f}",
                ),
            )

    def _start_memory_density(self):
        if self.memory_running:
            return
        try:
            n = int(self.memory_n_var.get().strip())
            if n <= 0:
                raise ValueError()
        except ValueError:
            messagebox.showwarning("Invalid N", "Memory N must be a positive integer.")
            return
        self.memory_running = True
        self.memory_btn.configure(state=tk.DISABLED)
        self.compare_state_var.set("Running memory density...")
        self.compare_progress.start(10)
        self.memory_n_current = n
        self._log(f"Starting memory density run (N={n}).")
        t = threading.Thread(target=self._run_memory_density_worker, daemon=True)
        t.start()

    def _run_memory_density_worker(self):
        try:
            mod = self._load_benchmark_module()
            benchmark_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "..", "0.3.0", "benchmark_comparison.py")
            )
            names = [s.name for s in mod.build_structure_list()]
            results = []
            ctx = mp.get_context("spawn")
            for idx, name in enumerate(names, 1):
                q = ctx.Queue()
                p = ctx.Process(
                    target=_memory_density_worker,
                    args=(benchmark_path, name, self.memory_n_current, q),
                )
                p.start()
                p.join(timeout=120)
                if p.is_alive():
                    p.terminate()
                    p.join()
                    results.append({"structure": name, "error": "timeout"})
                else:
                    if not q.empty():
                        results.append(q.get())
                    else:
                        results.append({"structure": name, "error": f"exit_code={p.exitcode}"})
                self.root.after(
                    0,
                    lambda i=idx, total=len(names): self.status_var.set(
                        f"Running memory density... {i}/{total} complete"
                    ),
                )
            self.root.after(0, lambda: self._apply_memory_density(results))
        except Exception as exc:
            self.root.after(0, lambda: self._memory_density_failed(exc))

    def _memory_density_failed(self, exc):
        self.memory_running = False
        self.memory_btn.configure(state=tk.NORMAL)
        self.compare_state_var.set("Memory density failed")
        self.compare_progress.stop()
        self._log(f"Memory density failed: {exc}")
        messagebox.showerror("Memory density failed", str(exc))

    def _apply_memory_density(self, results):
        self.memory_running = False
        self.memory_btn.configure(state=tk.NORMAL)
        self.compare_state_var.set("Memory density complete")
        self.compare_progress.stop()
        for item in self.memory_tree.get_children():
            self.memory_tree.delete(item)
        for item in self.tree_memory_tree.get_children():
            self.tree_memory_tree.delete(item)

        ok = [r for r in results if "error" not in r]
        bad = [r for r in results if "error" in r]
        ok.sort(key=lambda x: x["bytes_per_item"])
        ordered = ok + bad
        self.memory_rows = ordered
        for idx, r in enumerate(ordered, 1):
            if "error" in r:
                self.memory_tree.insert(
                    "",
                    tk.END,
                    tags=self._row_tags(r["structure"]),
                    values=(idx, r["structure"], "-", "-", "-", "-", f"error: {r['error']}"),
                )
            else:
                self.memory_tree.insert(
                    "",
                    tk.END,
                    tags=self._row_tags(r["structure"]),
                    values=(
                        idx,
                        r["structure"],
                        f"{r['delta_mb']:.3f}",
                        f"{r['bytes_per_item']:.2f}",
                        f"{r['rss_start_mb']:.3f}",
                        f"{r['rss_end_mb']:.3f}",
                        "ok",
                    ),
                )
        # Tree-only filtered memory density table.
        tree_rows = [r for r in ordered if r["structure"] in self.TREE_STRUCTURES]
        for idx, r in enumerate(tree_rows, 1):
            if "error" in r:
                self.tree_memory_tree.insert(
                    "",
                    tk.END,
                    tags=self._row_tags(r["structure"]),
                    values=(idx, r["structure"], "-", "-", "-", "-", f"error: {r['error']}"),
                )
            else:
                self.tree_memory_tree.insert(
                    "",
                    tk.END,
                    tags=self._row_tags(r["structure"]),
                    values=(
                        idx,
                        r["structure"],
                        f"{r['delta_mb']:.3f}",
                        f"{r['bytes_per_item']:.2f}",
                        f"{r['rss_start_mb']:.3f}",
                        f"{r['rss_end_mb']:.3f}",
                        "ok",
                    ),
                )
        self.tabs.select(6)
        self.status_var.set("Memory density completed")
        self._log("Memory density completed. Open Memory Density tab for details.")
        messagebox.showinfo("Memory density complete", "Memory density table has been updated.")

    def _refresh_snapshot(self):
        self.snapshot.delete("1.0", tk.END)
        mode = self.mode_var.get()
        self.snapshot.insert(tk.END, f"Mode: {mode}\n")
        self.snapshot.insert(tk.END, f"Last mini benchmark: {self.last_benchmark_result}\n\n")

        if mode == "persistent":
            root = self.engine.root
            null_node = lqft_engine.LQFTNode.get_null()
            if root is null_node:
                self.snapshot.insert(tk.END, "Tree is empty.\n")
            else:
                self.snapshot.insert(
                    tk.END,
                    "Persistent root exists.\n"
                    "Use CRUD + benchmark to observe behavior.\n",
                )
        else:
            st = self.engine.status() if hasattr(self.engine, "status") else {}
            self.snapshot.insert(tk.END, f"Status: {st}\n")
            light = getattr(self.engine, "_light_store", {})
            if light:
                self.snapshot.insert(tk.END, "\nSample entries:\n")
                for k, v in list(light.items())[:30]:
                    self.snapshot.insert(tk.END, f"- {k}: {v}\n")
            else:
                self.snapshot.insert(tk.END, "\nNo light-store entries visible (possibly native mode).\n")

    def _log(self, text):
        self.log.insert(tk.END, text + "\n")
        self.log.see(tk.END)

    def _populate_complexity_table(self, perf_map=None):
        for item in self.complexity_tree.get_children():
            self.complexity_tree.delete(item)

        rows = [
            {"structure": "dict", "insert": "O(1)", "search": "O(1)", "delete": "O(1)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "defaultdict_map", "insert": "O(1)", "search": "O(1)", "delete": "O(1)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "set_index", "insert": "O(1)", "search": "O(1)", "delete": "O(1)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "sorted_dict", "insert": "O(log n)", "search": "O(log n)", "delete": "O(log n)", "worst_case": "O(log n)", "space": "O(n)"},
            {"structure": "shelve_map", "insert": "avg O(1)", "search": "avg O(1)", "delete": "avg O(1)", "worst_case": "backend dependent", "space": "O(n)+storage overhead"},
            {"structure": "ordered_dict", "insert": "O(1)", "search": "O(1)", "delete": "O(1)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "list_linear_map", "insert": "O(n)", "search": "O(n)", "delete": "O(n)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "sorted_list_bisect", "insert": "O(n)", "search": "O(log n)", "delete": "O(n)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "bst_unbalanced", "insert": "O(log n)", "search": "O(log n)", "delete": "O(log n)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "avl_tree", "insert": "O(log n)", "search": "O(log n)", "delete": "O(log n)", "worst_case": "O(log n)", "space": "O(n)"},
            {"structure": "treap_tree", "insert": "O(log n) exp.", "search": "O(log n) exp.", "delete": "O(log n) exp.", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "trie_map", "insert": "O(k)", "search": "O(k)", "delete": "O(k)", "worst_case": "O(k)", "space": "O(total_key_chars)"},
            {"structure": "sqlite_in_memory", "insert": "O(log n)", "search": "O(log n)", "delete": "O(log n)", "worst_case": "O(log n)", "space": "O(n)+index/page"},
            {"structure": "lqft_persistent_tree", "insert": "O(log n) exp.", "search": "O(log n) exp.", "delete": "N/A", "worst_case": "hash/path dependent", "space": "O(n)+sharing"},
            {"structure": "adaptive_lqft_light", "insert": "O(1)", "search": "O(1)", "delete": "O(1)", "worst_case": "O(n)", "space": "O(n)"},
            {"structure": "adaptive_lqft_native", "insert": "near O(log n)", "search": "near O(log n)", "delete": "near O(log n)", "worst_case": "impl dependent", "space": "O(n)+native overhead"},
        ]

        used_perf = perf_map or self.BASE_PERF_RANK
        scored = []
        for r in rows:
            s = r["structure"]
            perf = used_perf.get(s, self.BASE_PERF_RANK.get(s, 99.0))
            mem = self.MEMORY_RANK.get(s, 99.0)
            comp = self.COMPLEXITY_RANK.get(s, 99.0)
            total = 0.5 * perf + 0.3 * mem + 0.2 * comp
            r["perf_rank"] = perf
            r["memory_rank"] = mem
            r["complexity_rank"] = comp
            r["total_score"] = total
            scored.append(r)

        scored.sort(key=lambda x: x["total_score"])
        self.last_complexity_scored = scored
        for idx, row in enumerate(scored, 1):
            self.complexity_tree.insert(
                "",
                tk.END,
                tags=self._row_tags(row["structure"]),
                values=(
                    idx,
                    row["structure"],
                    row["insert"],
                    row["search"],
                    row["delete"],
                    row["worst_case"],
                    row["space"],
                    f"{row['perf_rank']:.2f}",
                    f"{row['memory_rank']:.2f}",
                    f"{row['complexity_rank']:.2f}",
                    f"{row['total_score']:.2f}",
                ),
            )
        self.root.after(0, self._draw_complexity_graph)

    def _draw_complexity_graph(self, _event=None):
        if not hasattr(self, "complexity_graph_canvas"):
            return
        c = self.complexity_graph_canvas
        c.delete("all")
        rows = self.last_complexity_scored or []
        if not rows:
            c.create_text(
                20, 20, anchor=tk.W,
                text="Run a comparison to see the complexity graph.",
                fill=THEME["text_muted"],
                font=(THEME["font_family"], THEME["font_size"]),
            )
            c.configure(scrollregion=(0, 0, max(400, c.winfo_width()), max(200, c.winfo_height())))
            return

        # Use actual canvas size for responsive layout
        c.update_idletasks()
        width = max(300, c.winfo_width())
        height = max(280, c.winfo_height())
        metric = self.graph_metric_var.get()
        metric_label = "Complexity Rank" if metric == "complexity_rank" else "Total Score"
        n = len(rows)
        values = [float(r[metric]) for r in rows]
        max_val = max(values) if values else 1.0

        # Chart area: margins for axis labels and title
        left_margin = 48
        right_margin = 24
        top_margin = 44
        bottom_margin = 56
        chart_left = left_margin
        chart_width = max(100, width - left_margin - right_margin)
        chart_top = top_margin
        chart_height = max(80, height - top_margin - bottom_margin)
        chart_bottom = chart_top + chart_height

        # Glass title bar
        c.create_rectangle(0, 0, width, top_margin - 4, fill=THEME["glass"], outline=THEME["glass_border"])
        c.create_text(
            12, 14, anchor=tk.W,
            text=f"{metric_label} (lower is better)",
            fill=THEME["text"],
            font=(THEME["font_family"], 10, "bold"),
        )
        c.create_text(
            12, 32, anchor=tk.W,
            text="Indigo = other  ·  Amber = LQFT",
            fill=THEME["text_muted"],
            font=(THEME["font_family"], THEME["font_size_small"]),
        )

        # Y-axis grid and labels
        for g in range(5):
            y = chart_bottom - (g / 4.0) * chart_height
            c.create_line(chart_left, y, chart_left + chart_width, y, fill=THEME["glass_border_soft"])
            c.create_text(
                chart_left - 6, y, anchor=tk.E,
                text=f"{(g/4.0)*max_val:.1f}",
                fill=THEME["text_muted"],
                font=(THEME["font_family"], 8),
            )
        c.create_line(chart_left, chart_top, chart_left, chart_bottom, fill=THEME["text_muted"])
        c.create_line(chart_left, chart_bottom, chart_left + chart_width, chart_bottom, fill=THEME["text_muted"])

        # Vertical bars: min bar width for readability, allow horizontal scroll if many bars
        min_bar_w = 20
        gap = 6
        total_bars_width = n * min_bar_w + (n - 1) * gap if n else 0
        if total_bars_width <= chart_width:
            bar_width = (chart_width - (n - 1) * gap) / n if n else min_bar_w
            bar_width = max(8, min(bar_width, 60))
        else:
            bar_width = min_bar_w
        plot_width = n * bar_width + (n - 1) * gap
        scroll_w = max(width, chart_left + plot_width + right_margin)
        scroll_h = height

        for i, r in enumerate(rows):
            val = float(r[metric])
            norm = (val / max_val) if max_val else 0
            bar_h = max(2, norm * chart_height)
            x_center = chart_left + (i + 0.5) * (bar_width + gap)
            x1 = x_center - bar_width / 2
            x2 = x_center + bar_width / 2
            y1 = chart_bottom - bar_h
            y2 = chart_bottom
            is_lqft = "lqft" in r["structure"].lower()
            bar_color = THEME["accent"] if is_lqft else THEME["primary"]
            c.create_rectangle(x1, y1, x2, y2, fill=bar_color, outline=THEME["glass_border_soft"])
            # Value on top of bar
            c.create_text(
                x_center, y1 - 4, anchor=tk.S,
                text=f"{val:.1f}",
                fill=THEME["text"],
                font=(THEME["font_family"], 8, "bold"),
            )
            # Structure name below x-axis (abbreviate if needed)
            name = r["structure"]
            if len(name) > 12:
                name = name[:10] + ".."
            if is_lqft:
                name += "*"
            c.create_text(
                x_center, chart_bottom + 12, anchor=tk.N,
                text=name,
                fill=THEME["text"],
                font=(THEME["font_family"], 8),
            )

        c.configure(scrollregion=(0, 0, scroll_w, scroll_h))


def main():
    root = tk.Tk()
    app = LQFTDemoApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
