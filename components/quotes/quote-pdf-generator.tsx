import { QuoteDetail, QuoteStatus } from "@/app/(API)/api/dashboard/quotes/route";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type CalculationFunction = () => number;

export class QuotePdfGenerator {
    private quote: QuoteDetail;
    private formatAmount: (amount: number) => string;
    private calculateSubtotal: CalculationFunction;
    private calculateTaxes: CalculationFunction;
    private calculateDiscount: CalculationFunction;
    private calculateTotal: CalculationFunction;

    constructor(
        quote: QuoteDetail,
        formatAmount: (amount: number) => string,
        calculateSubtotal: CalculationFunction,
        calculateTaxes: CalculationFunction,
        calculateDiscount: CalculationFunction,
        calculateTotal: CalculationFunction
    ) {
        this.quote = quote;
        this.formatAmount = formatAmount;
        this.calculateSubtotal = calculateSubtotal;
        this.calculateTaxes = calculateTaxes;
        this.calculateDiscount = calculateDiscount;
        this.calculateTotal = calculateTotal;
    }

    async generateAndDownload(): Promise<void> {
        // Créer un nouveau document PDF au format A4
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Définir la police et les couleurs
        doc.setFont("helvetica");
        doc.setTextColor(33, 33, 33);

        // Mesures pour le positionnement
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const col1 = margin;
        const col2 = pageWidth / 2;
        const col3 = pageWidth - margin;

        // Logo et en-tête
        doc.setFontSize(20);
        doc.text(`Devis #${this.quote.number}`, col1, 20);

        // Statut
        doc.setFontSize(10);
        const statusLabels: { [key in QuoteStatus]: string } = {
            'DRAFT': 'Brouillon',
            'SENT': 'Envoyé',
            'ACCEPTED': 'Accepté',
            'REJECTED': 'Refusé',
            'CONVERTED': 'Converti en facture'
        };

        // Dates
        doc.text(`Créé le: ${format(this.quote.createdAt, "dd/MM/yyyy", { locale: fr })}`, col1, 30);
        doc.text(`Valide jusqu'au: ${format(this.quote.dueDate, "dd/MM/yyyy", { locale: fr })}`, col1, 35);
        doc.text(`Statut: ${statusLabels[this.quote.status]}`, col1, 40);

        // Informations client
        doc.setFontSize(12);
        doc.text("CLIENT", col1, 55);
        doc.setFontSize(10);
        doc.text(this.quote.client.name, col1, 60);
        doc.text(this.quote.client.email, col1, 65);
        doc.text(this.quote.client.address.street, col1, 70);
        doc.text(`${this.quote.client.address.postalCode} ${this.quote.client.address.city}`, col1, 75);
        doc.text(this.quote.client.address.country, col1, 80);

        // Informations entreprise
        doc.setFontSize(12);
        doc.text("ENTREPRISE", col2, 55);
        doc.setFontSize(10);
        doc.text(this.quote.company.name, col2, 60);
        doc.text(this.quote.company.email, col2, 65);
        doc.text(this.quote.company.address.street, col2, 70);
        doc.text(`${this.quote.company.address.postalCode} ${this.quote.company.address.city}`, col2, 75);
        doc.text(this.quote.company.address.country, col2, 80);
        doc.text(`TVA: ${this.quote.company.taxId}`, col2, 85);

        // Tableau des produits
        const tableStartY = 100;
        const tableData = this.quote.items.map(item => [
            { content: item.name, styles: { fontStyle: 'bold' as const } },
            { content: item.quantity.toString(), styles: { halign: 'center' as const } },
            // Fix les problèmes d'espace dans les chiffres en remplaçant les espaces par des espaces insécables
            { content: this.formatAmount(item.unitPrice).replace(/ /g, '\u00A0'), styles: { halign: 'right' as const } },
            { content: `${item.taxRate}%`, styles: { halign: 'right' as const } },
            { content: this.formatAmount(item.quantity * item.unitPrice).replace(/ /g, '\u00A0'), styles: { halign: 'right' as const } }
        ]);

        autoTable(doc, {
            startY: tableStartY,
            head: [
                [
                    { content: 'Description', styles: { fontStyle: 'bold' as const } },
                    { content: 'Qté', styles: { fontStyle: 'bold' as const, halign: 'center' as const } },
                    { content: 'Prix unitaire', styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
                    { content: 'TVA', styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
                    { content: 'Total HT', styles: { fontStyle: 'bold' as const, halign: 'right' as const } }
                ]
            ],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 20 },
                2: { cellWidth: 30 },
                3: { cellWidth: 20 },
                4: { cellWidth: 30 }
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [33, 33, 33],
                fontStyle: 'bold'
            }
        });

        // Récupérer la position Y après le tableau
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // Si on atteint la fin de la page, ajouter une nouvelle page
        if (finalY > 250) {
            doc.addPage();
            finalY = 20;
        }

        // Résumé financier
        const summaryX = col3 - 60;
        let summaryY = finalY + 10;

        // Fix les problèmes d'espace dans les chiffres
        doc.text("Sous-total HT:", summaryX, summaryY);
        doc.text(this.formatAmount(this.calculateSubtotal()).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

        summaryY += 7;
        doc.text("TVA:", summaryX, summaryY);
        doc.text(this.formatAmount(this.calculateTaxes()).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

        if (this.quote.discount) {
            summaryY += 7;
            const discountLabel = this.quote.discount.type === "percentage" ?
                `Remise (${this.quote.discount.value}%):` : "Remise:";
            doc.text(discountLabel, summaryX, summaryY);
            doc.text(`-${this.formatAmount(this.calculateDiscount()).replace(/ /g, '\u00A0')}`, col3, summaryY, { align: 'right' });
        }

        summaryY += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(summaryX, summaryY - 5, col3, summaryY - 5);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total TTC:", summaryX, summaryY);
        doc.text(this.formatAmount(this.calculateTotal()).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

        // Notes
        if (this.quote.notes) {
            summaryY += 20;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Notes:", col1, summaryY);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);

            const splitNotes = doc.splitTextToSize(this.quote.notes, pageWidth - 2 * margin);
            doc.text(splitNotes, col1, summaryY + 7);
        }

        // Pied de page
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height;
            doc.text(`Page ${i} sur ${pageCount}`, col3, pageHeight - 10, { align: 'right' });
        }

        // Télécharger le PDF
        doc.save(`devis_${this.quote.number}_${format(new Date(), "yyyyMMdd")}.pdf`);
    }
} 