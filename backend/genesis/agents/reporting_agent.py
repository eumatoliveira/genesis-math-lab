"""AGENT 15 — Scientific Reporting: emits 8 structured Markdown files + ReportLab PDF per problem."""

from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape as xml_escape

from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from genesis.config import RESEARCH_DIR, ensure_research_tree
from genesis.models import (
    CounterexampleRecord,
    ExperimentRecord,
    HardwareSnapshot,
    HypothesisRecord,
    ProblemFormalization,
    VisualProjectionReport,
)


class ScientificReportingAgent:
    """AGENT 15: Automatically generates the Section-16 9-file scientific dossier per problem."""

    agent_id = "agent_15"

    def __init__(self, research_dir: Path | None = None) -> None:
        self.research_dir = ensure_research_tree(research_dir or RESEARCH_DIR)

    def generate_dossier(
        self,
        formalization: ProblemFormalization,
        visual_report: VisualProjectionReport,
        experiment: ExperimentRecord,
        adaptive_benchmark: dict[str, Any],
        pattern_findings: dict[str, Any],
        hypotheses: list[HypothesisRecord],
        quantum_benchmark: dict[str, Any],
        counterexamples: list[CounterexampleRecord],
        formal_verification: dict[str, Any],
        red_team_audit: dict[str, Any],
        physics_eval: dict[str, Any],
        references: list[dict[str, Any]],
        hw: HardwareSnapshot,
    ) -> dict[str, str]:
        safe_problem_id = re.sub(r"[^a-zA-Z0-9_-]", "_", formalization.problem_id) or "problem"
        prob_dir = self.research_dir / "problems" / safe_problem_id
        prob_dir.mkdir(parents=True, exist_ok=True)

        paths: dict[str, str] = {}

        # 1. research-summary.md
        summary_md = f"""# {formalization.title} — Resumo Científico ({formalization.problem_id})

**Área:** {formalization.area}  
**Situação Científica Atual:** {formalization.current_scientific_status}  
**Classificação Epistemológica (GENESIS 9 Níveis):** `{formalization.formal_tier.value}`  
**Classificação Física:** `{formalization.physics_tier.value}`

> **Aviso de Governança:** Resultados experimentais e visuais não constituem demonstração matemática formal.

## Lente Filosófica e Metodológica (Separada da Evidência Científica)
- **Inspiração Filosófica & Ética:** {formalization.philosophical_lens.spiritual_ethical_inspiration}
- **Referências Científicas Históricas:** {formalization.philosophical_lens.scientist_methodology}
- **Analogia Conceitual:** {formalization.philosophical_lens.conceptual_analogy}
- **Nota:** {formalization.philosophical_lens.separation_notice}

## Descoberta Orientada por Visualização
- **Projeção Ativa:** `{visual_report.projection_name}` (`{visual_report.mapping_formula}`)
- **Regimes Detectados (Agente 06):** {', '.join(pattern_findings.get('detected_regimes', []))}
- **Pista Visual:** {pattern_findings.get('visual_cue')}
- **Economia por Amostragem Adaptativa:** `{adaptive_benchmark.get('compute_saved_percent')}%` menos avaliações ({adaptive_benchmark.get('adaptive_evaluations')} vs {adaptive_benchmark.get('brute_force_evaluations')} em força bruta).

## Próximos Experimentos Sugeridos
1. Refinar localmente os hotspots visuais detectados (`z_score > 1.5`) sem aumentar desperdício em regiões uniformes.
2. Submeter novas hipóteses simbólicas aprovadas pelo Red Team a verificadores formais externos (Lean 4 / Z3).
"""
        paths["research-summary.md"] = str(prob_dir / "research-summary.md")
        (prob_dir / "research-summary.md").write_text(summary_md, encoding="utf-8")

        # 2. mathematical-formulation.md
        form_md = f"""# Formulação Matemática — {formalization.title}

## Enunciado Original
{formalization.original_statement}

## Quantificadores e Variáveis
- **Quantificadores:** `{' ; '.join(formalization.quantifiers)}`
- **Variáveis:** `{json.dumps(formalization.variables, ensure_ascii=False)}`
- **Domínios:** `{json.dumps(formalization.domains, ensure_ascii=False)}`
- **Restrições:** {'; '.join(formalization.constraints)}

## Hipóteses, Conclusão e Invariantes
- **Hipóteses:** {'; '.join(formalization.hypotheses)}
- **Conclusão:** {formalization.conclusion}
- **Invariantes Conhecidos:** {'; '.join(formalization.known_invariants)}
- **Formulações Equivalentes:** {'; '.join(formalization.equivalent_formulations)}
- **Critério de Refutação:** {formalization.refutation_criteria}

## Correspondência Física (Agente 04)
- **Categoria:** `{physics_eval.get('classification')}`
- **Justificativa:** {formalization.physics_rationale}
- **Coerência de Interferência (Analogia Wi-Fi):** `{physics_eval.get('coherence_index')}`
"""
        paths["mathematical-formulation.md"] = str(prob_dir / "mathematical-formulation.md")
        (prob_dir / "mathematical-formulation.md").write_text(form_md, encoding="utf-8")

        # 3. literature-review.md
        refs_lines = "\n".join(
            f"- [{r.get('source_type', 'ref').upper()} | {r.get('language', 'en')}] **{r.get('title')}** — {r.get('authors')} ({r.get('url')})"
            for r in references
        ) or "- Nenhuma referência remota indexada neste ciclo offline; consulte o catálogo local em `research/references/`."
        lit_md = f"""# Revisão Bibliográfica e Fontes Abertas — {formalization.title}

## Situação Científica Atualizada
{formalization.current_scientific_status}

## Casos Particulares Demonstrados
{chr(10).join('- ' + c for c in formalization.special_cases_proved)}

## Referências Indexadas (Multilíngue / Open Access)
{refs_lines}
"""
        paths["literature-review.md"] = str(prob_dir / "literature-review.md")
        (prob_dir / "literature-review.md").write_text(lit_md, encoding="utf-8")

        # 4. experimental-results.md
        exp_md = f"""# Resultados Experimentais — {experiment.experiment_id}

- **Estratégia:** `{experiment.strategy}` | **Seed:** `{experiment.seed}`
- **Duração:** `{experiment.duration_ms} ms` | **RAM Processo/Host:** `{experiment.memory_mb} MB`
- **Resumo:** {experiment.output_data.get('summary')}

## Métricas Observadas
```json
{json.dumps(experiment.output_data.get('metrics', {}), indent=2, ensure_ascii=False)}
```

## Amostragem Adaptativa vs. Força Bruta (Seção 9)
```json
{json.dumps(adaptive_benchmark, indent=2, ensure_ascii=False)}
```

## Benchmark Quântico-Inspirado vs. Clássico (Agente 09)
```json
{json.dumps(quantum_benchmark, indent=2, ensure_ascii=False)}
```

## Propriedades da Projeção Multidimensional (Agente 03)
- **Preservadas:** {'; '.join(visual_report.preserved_properties)}
- **Descartadas:** {'; '.join(visual_report.discarded_properties)}

## Limitações Explícitas
{chr(10).join('- ' + l for l in experiment.limitations)}
"""
        paths["experimental-results.md"] = str(prob_dir / "experimental-results.md")
        (prob_dir / "experimental-results.md").write_text(exp_md, encoding="utf-8")

        # 5. hypotheses.md
        hyp_blocks = "\n".join(
            f"### `{h.hypothesis_id}` (Geração {h.generation} | {h.origin_agent})\n"
            f"- **Expressão SymPy:** `{h.expression_sympy}`\n"
            f"- **Descrição:** {h.plain_description}\n"
            f"- **MSE Treino / Fora-da-Amostra:** `{h.in_sample_mse}` / `{h.out_of_sample_mse}` | **Complexidade:** `{h.complexity_score}`\n"
            f"- **Status:** `{h.epistemological_tier.value}` | **Veredito Red Team:** `{h.red_team_verdict}` ({h.red_team_reason})\n"
            for h in hypotheses
        )
        hyp_md = f"# Hipóteses Simbólicas e Evolutivas — {formalization.title}\n\n{hyp_blocks}"
        paths["hypotheses.md"] = str(prob_dir / "hypotheses.md")
        (prob_dir / "hypotheses.md").write_text(hyp_md, encoding="utf-8")

        # 6. counterexamples.md
        cex_blocks = (
            "\n".join(
                f"- **{c.counterexample_id}** (Aritmética exata={c.exact_arithmetic_verified}): "
                f"Afirmação `{c.claimed_property}` -> Falha `{c.observed_failure}` | Testemunha: `{json.dumps(c.input_witness)}`"
                for c in counterexamples
            )
            if counterexamples
            else "- Nenhum contraexemplo à conjectura principal encontrado nesta janela finita."
        )
        cex_md = f"# Contraexemplos e Auditoria Red Team — {formalization.title}\n\n## Contraexemplos (Agente 10)\n{cex_blocks}\n\n## Revisão Red Team (Agente 13)\n```json\n{json.dumps(red_team_audit, indent=2, ensure_ascii=False)}\n```\n"
        paths["counterexamples.md"] = str(prob_dir / "counterexamples.md")
        (prob_dir / "counterexamples.md").write_text(cex_md, encoding="utf-8")

        # 7. formal-verification.md
        fv_md = f"""# Verificação Formal — {formalization.title}

- **Status Epistemológico Atribuído:** `{formal_verification.get('assigned_problem_tier')}`
- **Lean 4 Instalado Localmente:** `{formal_verification.get('lean4_installed')}`
- **Z3 Instalado Localmente:** `{formal_verification.get('z3_installed')}`
- **Contém `sorry`/`admit` falso?** `{formal_verification.get('contains_fake_sorry_proof')}`
- **Lema Auxiliar Finito (SymPy):** {formal_verification.get('sympy_auxiliary_lemma')} (`proved={formal_verification.get('sympy_auxiliary_lemma_proved')}`)

> {formal_verification.get('governance_note')}

```lean
{formal_verification.get('lean4_code', '')}
```
"""
        paths["formal-verification.md"] = str(prob_dir / "formal-verification.md")
        (prob_dir / "formal-verification.md").write_text(fv_md, encoding="utf-8")

        # 8. reproducibility.md
        rep_md = f"""# Manifesto de Reprodutibilidade e Proveniência — {experiment.experiment_id}

- **SHA-256 Hash:** `{experiment.sha256_hash}`
- **Git Commit:** `{experiment.git_commit}`
- **Timestamp (UTC):** `{experiment.timestamp}`
- **Seed Determinística:** `{experiment.seed}`
- **Precisão Numérica:** {experiment.numerical_precision}
- **Hardware Utilizado:** `{hw.cpu_model}` ({hw.logical_threads} threads), `{hw.ram_total_gb} GB` RAM, GPU `{hw.gpu_name}`
- **Dependências:** `{json.dumps(experiment.dependencies_version)}`

## Como Reproduzir Localmente
```bash
cd backend
python -c "from genesis.plugins.registry import get_plugin; print(get_plugin('{formalization.problem_id}').run(seed={experiment.seed}, params={json.dumps(experiment.parameters)}).metrics)"
```
"""
        paths["reproducibility.md"] = str(prob_dir / "reproducibility.md")
        (prob_dir / "reproducibility.md").write_text(rep_md, encoding="utf-8")

        # 9. research-report.pdf (Vector PDF via ReportLab with Chart & Tables!)
        pdf_path = prob_dir / "research-report.pdf"
        self._render_pdf(
            pdf_path=pdf_path,
            formalization=formalization,
            visual_report=visual_report,
            experiment=experiment,
            adaptive_benchmark=adaptive_benchmark,
            pattern_findings=pattern_findings,
            hypotheses=hypotheses,
            counterexamples=counterexamples,
            formal_verification=formal_verification,
            red_team_audit=red_team_audit,
            hw=hw,
        )
        paths["research-report.pdf"] = str(pdf_path)
        return paths

    def _render_pdf(
        self,
        pdf_path: Path,
        formalization: ProblemFormalization,
        visual_report: VisualProjectionReport,
        experiment: ExperimentRecord,
        adaptive_benchmark: dict[str, Any],
        pattern_findings: dict[str, Any],
        hypotheses: list[HypothesisRecord],
        counterexamples: list[CounterexampleRecord],
        formal_verification: dict[str, Any],
        red_team_audit: dict[str, Any],
        hw: HardwareSnapshot,
    ) -> None:
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("GenesisTitle", parent=styles["Heading1"], fontSize=16, textColor=colors.HexColor("#0f172a"), spaceAfter=8)
        h2_style = ParagraphStyle("GenesisH2", parent=styles["Heading2"], fontSize=12, textColor=colors.HexColor("#1e3a8a"), spaceBefore=10, spaceAfter=4)
        body_style = ParagraphStyle("GenesisBody", parent=styles["BodyText"], fontSize=9.5, leading=13)
        mono_style = ParagraphStyle("GenesisMono", parent=styles["Code"], fontSize=8, leading=10)

        story: list[Any] = [
            Paragraph(f"GENESIS • Relatório Científico: {xml_escape(formalization.title)}", title_style),
            Paragraph(
                f"<b>ID:</b> {xml_escape(formalization.problem_id)} | <b>Área:</b> {xml_escape(formalization.area)} | "
                f"<b>Status Formal:</b> {xml_escape(formalization.formal_tier.value)} | <b>SHA-256:</b> {xml_escape(experiment.sha256_hash[:18])}...",
                body_style,
            ),
            Spacer(1, 6),
            Paragraph("1. Enunciado e Situação Científica", h2_style),
            Paragraph(f"<b>Enunciado:</b> {xml_escape(formalization.original_statement)}", body_style),
            Paragraph(f"<b>Status Atualizado:</b> {xml_escape(formalization.current_scientific_status)}", body_style),
            Paragraph(
                f"<b>Separação Filosófica (Sec. 3):</b> {xml_escape(formalization.philosophical_lens.spiritual_ethical_inspiration)} "
                f"<i>({xml_escape(formalization.philosophical_lens.separation_notice)})</i>",
                body_style,
            ),
            Paragraph("2. Descoberta Orientada por Visualização e Amostragem Adaptativa", h2_style),
            Paragraph(
                f"<b>Projeção:</b> {xml_escape(visual_report.projection_name)} | <b>Pista Visual:</b> {xml_escape(str(pattern_findings.get('visual_cue', '')))}",
                body_style,
            ),
        ]

        # Plot 2D curve directly into vector PDF Drawing
        pts_2d = [
            (float(p[0]), float(p[1]))
            for p in visual_report.curve_2d_points[:64]
            if len(p) >= 2 and math.isfinite(float(p[0])) and math.isfinite(float(p[1]))
        ]
        if len(pts_2d) >= 2:
            drawing = Drawing(460, 140)
            lp = LinePlot()
            lp.x = 35
            lp.y = 20
            lp.width = 400
            lp.height = 105
            lp.data = [pts_2d]
            lp.lines[0].strokeColor = colors.HexColor("#0284c7")
            lp.lines[0].strokeWidth = 1.6
            drawing.add(lp)
            story.append(drawing)

        # Key metrics & Adaptive vs Brute Force Table
        table_data = [
            ["Indicador", "Valor Observado"],
            ["Experimento / Seed", f"{experiment.experiment_id} (seed={experiment.seed})"],
            ["Duração / RAM Host", f"{experiment.duration_ms} ms | {hw.ram_available_gb} GB livre / {hw.ram_total_gb} GB"],
            ["Economia Adaptativa (18x18)", f"{adaptive_benchmark.get('compute_saved_percent')}% ({adaptive_benchmark.get('adaptive_evaluations')} vs {adaptive_benchmark.get('brute_force_evaluations')})"],
            ["Simetria / Freq. Dominante FFT", f"{pattern_findings.get('symmetry_index')} | f={pattern_findings.get('dominant_frequency')}"],
            ["Revisão Red Team", f"Aprovadas p/ teste: {red_team_audit.get('approved_for_testing')} | Rejeitadas: {red_team_audit.get('rejected')}"],
            ["Contraexemplos (Agente 10)", str(len(counterexamples))],
        ]
        tbl = Table(table_data, colWidths=[175, 290])
        tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
                ]
            )
        )
        story.extend([Spacer(1, 6), tbl])

        story.append(Paragraph("3. Hipóteses Simbólicas, Contraexemplos e Limitações", h2_style))
        for h in hypotheses[:4]:
            story.append(
                Paragraph(
                    f"• <b>{xml_escape(h.hypothesis_id)}</b> [{xml_escape(h.red_team_verdict)}]: {xml_escape(h.expression_sympy)} "
                    f"(OOS MSE={h.out_of_sample_mse}, complexidade={h.complexity_score})",
                    mono_style,
                )
            )
        for c in counterexamples[:3]:
            story.append(Paragraph(f"• <b>Contraexemplo {xml_escape(c.counterexample_id)}:</b> {xml_escape(c.observed_failure)}", body_style))
        for lim in experiment.limitations:
            story.append(Paragraph(f"• <i>Limitação:</i> {xml_escape(lim)}", body_style))

        story.append(Paragraph("4. Verificação Formal & Reprodutibilidade", h2_style))
        story.append(
            Paragraph(
                f"Lean 4 local: {formal_verification.get('lean4_installed')} | "
                f"Lema SymPy auxiliar: {xml_escape(str(formal_verification.get('sympy_auxiliary_lemma', '')))} | "
                f"Git commit: {xml_escape(experiment.git_commit)}",
                body_style,
            )
        )

        doc = SimpleDocTemplate(str(pdf_path), pagesize=A4, title=f"GENESIS - {formalization.title}")
        doc.build(story)
