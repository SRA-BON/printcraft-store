import { jsPDF } from "jspdf";

export const generateInvoice = (order, type = 'customer') => {
    const doc = new jsPDF();
    const isSeller = type === 'seller';

    // Header
    doc.setFillColor(30, 41, 59); // Dark blue
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Rong-Tuli Pro", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Printing & Customization", 20, 32);

    // Invoice Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(20);
    doc.text("INVOICE", 140, 60);

    doc.setFontSize(10);
    doc.text(`Invoice #: INV-${order.orderId || order._id.substring(0, 8)}`, 140, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 75);
    doc.text(`Status: ${order.status.toUpperCase()}`, 140, 80);

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.text(isSeller ? "MERCHANT COPY" : "CUSTOMER COPY", 20, 60);

    doc.setFont("helvetica", "normal");
    doc.text(isSeller ? "Merchant: Rong-Tuli Partner" : `Customer: ${order.shippingAddress.name}`, 20, 70);
    doc.text(`Phone: ${order.shippingAddress.phone || 'N/A'}`, 20, 75);
    doc.text(`Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}`, 20, 80);

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(20, 100, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Item", 25, 106);
    doc.text("Qty", 120, 106);
    doc.text("Price", 145, 106);
    doc.text("Total", 175, 106);

    // Table Content
    doc.setFont("helvetica", "normal");
    let y = 120;
    order.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name}`, 25, y);
        doc.text(`${item.quantity}`, 122, y);
        doc.text(`tk ${item.price}`, 145, y);
        doc.text(`tk ${item.price * item.quantity}`, 175, y);
        y += 10;
    });

    // Summary
    doc.setDrawColor(226, 232, 240);
    doc.line(110, y + 10, 190, y + 10);

    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 140, y + 20);
    doc.text(`tk ${order.totalPrice}`, 175, y + 20);

    doc.text("Shipping:", 140, y + 30);
    doc.text("tk 60", 175, y + 30);

    doc.setFillColor(30, 41, 59);
    doc.rect(135, y + 35, 55, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("Grand Total:", 140, y + 43);
    doc.text(`tk ${order.totalPrice + 60}`, 170, y + 43);

    // Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text("This is an auto-generated invoice and does not require a physical signature.", 105, 280, { align: "center" });
    doc.text("Thank you for choosing Rong-Tuli!", 105, 285, { align: "center" });

    doc.save(`Invoice_${isSeller ? 'Merchant' : 'User'}_${order.orderId || order._id}.pdf`);
};
