"""AGENT 12 — Hardware Optimization: real psutil + RTX 3050 GPU telemetry and home-PC safety governance."""

from __future__ import annotations

import platform
import shutil
import subprocess
from pathlib import Path

import psutil

from genesis.config import HardwareLimits, REPO_ROOT
from genesis.models import HardwareSnapshot


class HardwareOptimizationAgent:
    """AGENT 12: Detects local hardware and enforces RAM/CPU/disk backpressure limits."""

    agent_id = "agent_12"

    def __init__(self, limits: HardwareLimits | None = None) -> None:
        self.limits = limits or HardwareLimits()

    def _query_nvidia_smi(self) -> tuple[str, float | None, float | None, float | None]:
        try:
            out = subprocess.check_output(
                [
                    "nvidia-smi",
                    "--query-gpu=name,memory.total,utilization.gpu,temperature.gpu",
                    "--format=csv,noheader,nounits",
                ],
                stderr=subprocess.DEVNULL,
                text=True,
                timeout=2.0,
            ).strip()
            if not out:
                return "GPU não detectada", None, None, None
            parts = [p.strip() for p in out.splitlines()[0].split(",")]
            name = parts[0] if len(parts) > 0 else "NVIDIA GPU"
            vram = float(parts[1]) if len(parts) > 1 and parts[1].replace(".", "", 1).isdigit() else None
            util = float(parts[2]) if len(parts) > 2 and parts[2].replace(".", "", 1).isdigit() else None
            temp = float(parts[3]) if len(parts) > 3 and parts[3].replace(".", "", 1).isdigit() else None
            return name, vram, util, temp
        except Exception:
            return "GPU via WebGL/CPU Fallback", None, None, None

    def snapshot(self, storage_path: Path | None = None) -> HardwareSnapshot:
        vm = psutil.virtual_memory()
        cpu_pct = float(psutil.cpu_percent(interval=0.05))
        proc_ram_gb = psutil.Process().memory_info().rss / (1024**3)
        target_disk = storage_path if storage_path and storage_path.exists() else REPO_ROOT
        disk = shutil.disk_usage(target_disk)
        free_gb = disk.free / (1024**3)
        ram_total_gb = vm.total / (1024**3)
        ram_used_gb = vm.used / (1024**3)
        ram_avail_gb = vm.available / (1024**3)

        gpu_name, gpu_vram, gpu_util, gpu_temp = self._query_nvidia_smi()
        cuda_ok = False
        try:
            import torch

            cuda_ok = bool(torch.cuda.is_available())
        except Exception:
            cuda_ok = False

        warnings: list[str] = []
        within_limits = True
        if cpu_pct > self.limits.max_cpu_percent:
            warnings.append(f"CPU acima do teto alvo ({cpu_pct:.1f}% > {self.limits.max_cpu_percent}%): ativar redução adaptativa.")
            if cpu_pct > max(95.0, self.limits.max_cpu_percent):
                within_limits = False
        if proc_ram_gb > self.limits.max_lab_ram_gb:
            warnings.append(
                f"RAM do processo GENESIS ({proc_ram_gb:.2f} GB) excedeu o teto ({self.limits.max_lab_ram_gb} GB): backpressure ativo."
            )
            within_limits = False
        if ram_avail_gb < 2.0:
            warnings.append("RAM disponível baixa (< 2 GB): backpressure ativo.")
            within_limits = False
        if free_gb < self.limits.min_free_disk_gb:
            warnings.append(f"Espaço em disco baixo ({free_gb:.2f} GB < {self.limits.min_free_disk_gb} GB): pausar gravações pesadas.")
            within_limits = False
        if gpu_temp is not None and gpu_temp > 85.0:
            warnings.append(f"Temperatura GPU elevada ({gpu_temp:.0f}°C): reduzir resolução de renderização.")

        return HardwareSnapshot(
            os_name=f"{platform.system()} {platform.release()}",
            cpu_model=platform.processor() or "x86_64 CPU",
            physical_cores=psutil.cpu_count(logical=False),
            logical_threads=psutil.cpu_count(logical=True) or 4,
            cpu_percent=round(cpu_pct, 1),
            ram_total_gb=round(ram_total_gb, 2),
            ram_used_gb=round(ram_used_gb, 2),
            ram_available_gb=round(ram_avail_gb, 2),
            disk_free_gb=round(free_gb, 2),
            gpu_name=gpu_name,
            gpu_vram_mb=gpu_vram,
            gpu_utilization_percent=gpu_util,
            gpu_temp_c=gpu_temp,
            cuda_available=cuda_ok,
            within_safe_limits=within_limits,
            warnings=warnings,
        )
