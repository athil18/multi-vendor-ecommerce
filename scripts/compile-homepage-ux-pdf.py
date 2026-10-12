"""
Compiles .ai/nexus_ux_reflection_forensic_audit_and_homepage_transformation_plan.md into an executive PDF using ReportLab.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def create_homepage_ux_report_pdf():
    pdf_path = r"e:\500+_AI_Agent\.ai\nexus_ux_reflection_forensic_audit_and_homepage_transformation_plan.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    primary_color = colors.HexColor("#0f172a") # Slate 900
    brand_emerald = colors.HexColor("#059669") # Emerald 600
    brand_blue = colors.HexColor("#2563eb") # Blue 600
    card_bg = colors.HexColor("#f8fafc") # Slate 50
    border_color = colors.HexColor("#e2e8f0") # Slate 200

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b")
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=brand_emerald
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # Header
    story.append(Paragraph("NEXUS MULTI-VENDOR E-COMMERCE", title_style))
    story.append(Paragraph("<b>Storefront UX Reflection Audit & 20 UX Laws Transformation Plan</b>", ParagraphStyle('Sub', fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=brand_blue)))
    story.append(Paragraph("Governance: 500+ AI Agent Ecosystem &bull; Date: October 3, 2026 &bull; Status: Forensic Audit Complete & Plan Ready", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=4, spaceAfter=10))

    # Forensic Finding
    story.append(Paragraph("1. Forensic Diagnosis: Why the UI Looked Unchanged on http://localhost:3000", h1_style))
    story.append(Paragraph(
        "<b>The Direct Cause:</b> In the prior execution phase, the 20 UX Laws were implemented exclusively within the transaction funnel: "
        "the Cart (<code>/cart</code>), Multi-Step Checkout (<code>/checkout</code>), Order Confirmation (<code>/checkout/success</code>), "
        "and Seller Studio (<code>/seller</code>). However, the <b>Landing Homepage (<code>/</code>)</b> and <b>Global Catalog (<code>/products</code>)</b> "
        "were untouched. Because the homepage is the initial entry point viewed on <code>http://localhost:3000</code>, the lack of storefront reflection "
        "created the accurate perception that the design remained in its prior state.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Transformation Matrix
    story.append(Paragraph("2. Storefront 20 UX Laws Redesign Blueprint", h1_style))
    
    redesign_data = [
        [Paragraph("<b>UX Law</b>", table_header_style), Paragraph("<b>Visual Implementation on Homepage & Discovery</b>", table_header_style), Paragraph("<b>Cognitive Impact</b>", table_header_style)],
        [
            Paragraph("<b>Hick's Law (#1)<br/>Miller's Law (#5)</b>", table_cell_style),
            Paragraph("<b>Curated 4-Category Filter Pills:</b> Clean tactile pills (Mechanical Tech, Tuscan Leather, Velocity Road, Bespoke Jewelry) replacing endless lists.", table_cell_style),
            Paragraph("Eliminates choice paralysis; decisions made in &lt; 2 seconds.", table_cell_style)
        ],
        [
            Paragraph("<b>Von Restorff (#7)<br/>Fitts's Law (#2, #8)</b>", table_cell_style),
            Paragraph("<b>Curator's Spotlight Masterpiece:</b> A dominant editorial feature card with ambient glow, high-contrast typography, and 52px direct Escrow CTA.", table_cell_style),
            Paragraph("Creates a single dominant visual focal point with ergonomic click target.", table_cell_style)
        ],
        [
            Paragraph("<b>Goal-Gradient (#20)<br/>Zeigarnik (#11)</b>", table_cell_style),
            Paragraph("<b>Storefront White-Glove Courier Tier:</b> A floating live progress ticker showing remainder to unlock complimentary courier delivery.", table_cell_style),
            Paragraph("Incentivizes buyer engagement from the very first screen.", table_cell_style)
        ],
        [
            Paragraph("<b>Similarity (#16)<br/>Connectedness (#17)</b>", table_cell_style),
            Paragraph("<b>Connected Specimen Badges:</b> Standardized tactile pills connecting Batch #, Escrow Vault Guarantee, and 90% Maker Cut.", table_cell_style),
            Paragraph("Harmonious Apple-grade design language across every product card.", table_cell_style)
        ],
        [
            Paragraph("<b>Doherty Threshold (#6)</b>", table_cell_style),
            Paragraph("<b>Sub-400ms Filter Transitions:</b> Instant zero-refresh category switching with GPU-accelerated micro-animations.", table_cell_style),
            Paragraph("Interface feels responsive, alive, and lightning-fast.", table_cell_style)
        ]
    ]

    redesign_table = Table(redesign_data, colWidths=[120, 290, 120])
    redesign_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, 1), card_bg),
        ('BACKGROUND', (0, 3), (-1, 3), card_bg),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(redesign_table)
    story.append(Spacer(1, 10))

    # Implementation Readiness
    story.append(Paragraph("3. Immediate Action Plan", h1_style))
    story.append(Paragraph(
        "Upon your green light, we will apply these enhancements directly to <code>src/app/page.tsx</code> and <code>src/components/ProductCard.tsx</code>. "
        "Once applied, the moment you refresh <code>http://localhost:3000</code>, the visual transformation of the 20 UX Laws will be immediately prominent, "
        "prestigious, and undeniable.",
        body_style
    ))

    doc.build(story)
    print(f"PDF generated successfully: {pdf_path}")

if __name__ == '__main__':
    create_homepage_ux_report_pdf()
