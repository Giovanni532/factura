import { QuoteDetail, QuoteStatus } from "@/app/(API)/api/dashboard/quotes/route";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

type CalculationFunction = () => number;

export class QuotePrintService {
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

    print(contentRef: HTMLDivElement | null): void {
        // Option 1: Open in a new window with custom formatting (preferred for best quality)
        if (window.confirm("Souhaitez-vous imprimer avec une mise en page optimisée? Cliquez sur OK pour une meilleure qualité ou Annuler pour utiliser l'impression standard.")) {
            this.printOptimized();
        } else {
            // Option 2: Use the browser's built-in print functionality with CSS
            this.printStandard(contentRef);
        }
    }

    private printOptimized(): void {
        toast.info("Préparation de l'impression...");

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Impossible d'ouvrir la fenêtre d'impression");
            return;
        }

        // CSS pour le document imprimé
        const printStyles = `
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; }
                .container { max-width: 800px; margin: 0 auto; }
                .header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                .logo-title { display: flex; flex-direction: column; }
                .quote-number { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
                .status { display: inline-block; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
                .status-draft { background-color: #f1f5f9; color: #64748b; }
                .status-sent { background-color: #dcfce7; color: #15803d; }
                .status-accepted { background-color: #e0f2fe; color: #0369a1; }
                .status-rejected { background-color: #fee2e2; color: #b91c1c; }
                .status-converted { background-color: #f5f5f5; color: #525252; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
                .info-box h3 { font-size: 1rem; margin-bottom: 0.5rem; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                .table th { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
                .table td { padding: 0.75rem; border-bottom: 1px solid #eee; }
                .item-name { font-weight: bold; }
                .item-desc { font-size: 0.9rem; color: #666; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .summary { margin-left: auto; width: 300px; margin-bottom: 2rem; }
                .summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
                .total-row { font-weight: bold; font-size: 1.1rem; padding-top: 0.5rem; border-top: 1px solid #ddd; }
                .notes { padding: 1rem; background-color: #f9fafb; border-radius: 4px; margin-bottom: 2rem; }
            </style>
        `;

        // Déterminer le statut et sa classe CSS
        const getStatusClass = (status: QuoteStatus) => {
            const statusMap = {
                'DRAFT': 'status-draft',
                'SENT': 'status-sent',
                'ACCEPTED': 'status-accepted',
                'REJECTED': 'status-rejected',
                'CONVERTED': 'status-converted'
            };
            return statusMap[status] || 'status-draft';
        };

        const getStatusLabel = (status: QuoteStatus) => {
            const statusLabels = {
                'DRAFT': 'Brouillon',
                'SENT': 'Envoyé',
                'ACCEPTED': 'Accepté',
                'REJECTED': 'Refusé',
                'CONVERTED': 'Converti en facture'
            };
            return statusLabels[status] || 'Brouillon';
        };

        // Contenu du document
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Devis ${this.quote.number}</title>
                ${printStyles}
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo-title">
                            <div class="quote-number">Devis #${this.quote.number}</div>
                            <div>
                                <span class="status ${getStatusClass(this.quote.status)}">${getStatusLabel(this.quote.status)}</span>
                                <span style="margin-left: 10px;">Créé le ${format(this.quote.createdAt, "dd MMMM yyyy", { locale: fr })}</span>
                            </div>
                        </div>
                        ${this.quote.company.logo ? `<img src="${this.quote.company.logo}" alt="Logo" style="max-height: 60px;">` : ''}
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-box">
                            <h3>Client</h3>
                            <div><strong>${this.quote.client.name}</strong></div>
                            <div>${this.quote.client.email}</div>
                            <div>${this.quote.client.address.street}</div>
                            <div>${this.quote.client.address.postalCode} ${this.quote.client.address.city}</div>
                            <div>${this.quote.client.address.country}</div>
                        </div>
                        
                        <div class="info-box">
                            <h3>Entreprise</h3>
                            <div><strong>${this.quote.company.name}</strong></div>
                            <div>${this.quote.company.email}</div>
                            <div>${this.quote.company.address.street}</div>
                            <div>${this.quote.company.address.postalCode} ${this.quote.company.address.city}</div>
                            <div>${this.quote.company.address.country}</div>
                            <div>TVA: ${this.quote.company.taxId}</div>
                        </div>
                        
                        <div class="info-box">
                            <h3>Dates</h3>
                            <div>Date de création: ${format(this.quote.createdAt, "dd MMMM yyyy", { locale: fr })}</div>
                            <div>Date de validité: ${format(this.quote.dueDate, "dd MMMM yyyy", { locale: fr })}</div>
                        </div>
                    </div>
                    
                    <h3>Produits et services</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th style="width: 40%;">Description</th>
                                <th class="text-center">Quantité</th>
                                <th class="text-right">Prix unitaire</th>
                                <th class="text-right">TVA</th>
                                <th class="text-right">Total HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.quote.items.map(item => `
                                <tr>
                                    <td>
                                        <div class="item-name">${item.name}</div>
                                        <div class="item-desc">${item.description}</div>
                                    </td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-right">${this.formatAmount(item.unitPrice)}</td>
                                    <td class="text-right">${item.taxRate}%</td>
                                    <td class="text-right">${this.formatAmount(item.quantity * item.unitPrice)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div style="display: flex;">
                        ${this.quote.notes ? `
                            <div style="flex: 1;">
                                <h3>Notes</h3>
                                <div class="notes">${this.quote.notes}</div>
                            </div>
                        ` : ''}
                        
                        <div class="summary">
                            <div class="summary-row">
                                <span>Sous-total HT</span>
                                <span>${this.formatAmount(this.calculateSubtotal())}</span>
                            </div>
                            <div class="summary-row">
                                <span>TVA</span>
                                <span>${this.formatAmount(this.calculateTaxes())}</span>
                            </div>
                            ${this.quote.discount ? `
                                <div class="summary-row">
                                    <span>Remise ${this.quote.discount.type === "percentage" ? `(${this.quote.discount.value}%)` : ''}</span>
                                    <span>-${this.formatAmount(this.calculateDiscount())}</span>
                                </div>
                            ` : ''}
                            <div class="summary-row total-row">
                                <span>Total TTC</span>
                                <span>${this.formatAmount(this.calculateTotal())}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Attendre que le contenu soit chargé
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                // Ne pas fermer pour permettre à l'utilisateur de voir les options d'impression
            }, 500);
        };
    }

    private printStandard(contentRef: HTMLDivElement | null): void {
        if (contentRef) {
            // Add a print-only class to the content for CSS to target
            contentRef.classList.add('print-content');
            window.print();
            // Remove the class after printing
            setTimeout(() => {
                if (contentRef) {
                    contentRef.classList.remove('print-content');
                }
            }, 500);
        } else {
            window.print();
        }
    }
} 