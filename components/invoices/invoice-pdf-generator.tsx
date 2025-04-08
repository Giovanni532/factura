import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types pour représenter les données d'une facture
export interface InvoiceItem {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface InvoiceClient {
    id: string;
    name: string;
    email: string;
    company?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
}

export interface InvoiceBusiness {
    name: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    taxId?: string;
    logoUrl?: string;
}

export interface InvoicePayment {
    id: string;
    amount: number;
    method: string;
    paidAt: Date;
}

export interface InvoiceDetail {
    id: string;
    number: string;
    status: string;
    createdAt: Date;
    dueDate: Date;
    totalHT: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    isPaid: boolean;
    client: InvoiceClient;
    business?: InvoiceBusiness;
    items: InvoiceItem[];
    payments: InvoicePayment[];
}

export class InvoicePdfGenerator {
    private invoice: InvoiceDetail;
    private formatAmount: (amount: number) => string;

    constructor(
        invoice: InvoiceDetail,
        formatAmount: (amount: number) => string
    ) {
        this.invoice = invoice;
        this.formatAmount = formatAmount;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case "PAID": return "Payée";
            case "PENDING": return "En attente";
            case "OVERDUE": return "En retard";
            case "CANCELED": return "Annulée";
            default: return status;
        }
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
        doc.text(`Facture #${this.invoice.number}`, col1, 20);

        // Statut
        doc.setFontSize(10);

        // Dates
        doc.text(`Créée le: ${format(this.invoice.createdAt, "dd/MM/yyyy", { locale: fr })}`, col1, 30);
        doc.text(`Échéance: ${format(this.invoice.dueDate, "dd/MM/yyyy", { locale: fr })}`, col1, 35);
        doc.text(`Statut: ${this.getStatusLabel(this.invoice.status)}`, col1, 40);

        // Informations client
        doc.setFontSize(12);
        doc.text("CLIENT", col1, 55);
        doc.setFontSize(10);
        doc.text(this.invoice.client.name, col1, 60);
        doc.text(this.invoice.client.email, col1, 65);

        let clientY = 70;

        if (this.invoice.client.company) {
            doc.text(this.invoice.client.company, col1, clientY);
            clientY += 5;
        }

        if (this.invoice.client.address) {
            doc.text(this.invoice.client.address, col1, clientY);
            clientY += 5;
        }

        if (this.invoice.client.city && this.invoice.client.postalCode) {
            doc.text(`${this.invoice.client.postalCode} ${this.invoice.client.city}`, col1, clientY);
            clientY += 5;
        }

        if (this.invoice.client.country) {
            doc.text(this.invoice.client.country, col1, clientY);
        }

        // Informations entreprise
        if (this.invoice.business) {
            doc.setFontSize(12);
            doc.text("ENTREPRISE", col2, 55);
            doc.setFontSize(10);
            doc.text(this.invoice.business.name, col2, 60);

            let businessY = 65;

            if (this.invoice.business.email) {
                doc.text(this.invoice.business.email, col2, businessY);
                businessY += 5;
            }

            if (this.invoice.business.address) {
                doc.text(this.invoice.business.address, col2, businessY);
                businessY += 5;
            }

            if (this.invoice.business.city && this.invoice.business.postalCode) {
                doc.text(`${this.invoice.business.postalCode} ${this.invoice.business.city}`, col2, businessY);
                businessY += 5;
            }

            if (this.invoice.business.country) {
                doc.text(this.invoice.business.country, col2, businessY);
                businessY += 5;
            }

            if (this.invoice.business.taxId) {
                doc.text(`TVA: ${this.invoice.business.taxId}`, col2, businessY);
            }
        }

        // Tableau des produits
        const tableStartY = 100;
        const tableData = this.invoice.items.map(item => [
            {
                content: item.name + (item.description ? `\n${item.description}` : ''),
                styles: { fontStyle: 'bold' as const }
            },
            { content: item.quantity.toString(), styles: { halign: 'center' as const } },
            // Fix les problèmes d'espace dans les chiffres en remplaçant les espaces par des espaces insécables
            { content: this.formatAmount(item.unitPrice).replace(/ /g, '\u00A0'), styles: { halign: 'right' as const } },
            { content: `${this.invoice.vatRate}%`, styles: { halign: 'right' as const } },
            { content: this.formatAmount(item.total).replace(/ /g, '\u00A0'), styles: { halign: 'right' as const } }
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
        doc.text(this.formatAmount(this.invoice.totalHT).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

        summaryY += 7;
        doc.text(`TVA (${this.invoice.vatRate}%):`, summaryX, summaryY);
        doc.text(this.formatAmount(this.invoice.vatAmount).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

        summaryY += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(summaryX, summaryY - 5, col3, summaryY - 5);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total TTC:", summaryX, summaryY);
        doc.text(this.formatAmount(this.invoice.total).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

        if (this.invoice.paidAmount > 0) {
            summaryY += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Payé:", summaryX, summaryY);
            doc.text(this.formatAmount(this.invoice.paidAmount).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });

            if (!this.invoice.isPaid) {
                summaryY += 7;
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("Reste à payer:", summaryX, summaryY);
                doc.text(this.formatAmount(this.invoice.remainingAmount).replace(/ /g, '\u00A0'), col3, summaryY, { align: 'right' });
            }
        }

        // Historique des paiements si présent
        if (this.invoice.payments && this.invoice.payments.length > 0) {
            summaryY += 20;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Historique des paiements:", col1, summaryY);

            summaryY += 8;

            // Tableau des paiements
            const paymentsData = this.invoice.payments.map(payment => [
                format(new Date(payment.paidAt), "dd/MM/yyyy", { locale: fr }),
                payment.method,
                this.formatAmount(payment.amount).replace(/ /g, '\u00A0')
            ]);

            autoTable(doc, {
                startY: summaryY,
                head: [
                    [
                        { content: 'Date', styles: { fontStyle: 'bold' as const } },
                        { content: 'Méthode', styles: { fontStyle: 'bold' as const } },
                        { content: 'Montant', styles: { fontStyle: 'bold' as const, halign: 'right' as const } }
                    ]
                ],
                body: paymentsData,
                theme: 'grid',
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 80 },
                    2: { cellWidth: 40, halign: 'right' as const }
                },
                headStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [33, 33, 33],
                    fontStyle: 'bold'
                }
            });
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
        doc.save(`facture_${this.invoice.number}_${format(new Date(), "yyyyMMdd")}.pdf`);
    }
} 