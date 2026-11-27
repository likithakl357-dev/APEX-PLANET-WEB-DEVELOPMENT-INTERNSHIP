import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const amount = value => 'INR ' + Number(value || 0).toLocaleString('en-IN');

export async function createOrderReceipt(order) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('FreshNest order receipt ' + order.id);
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const supported = new Set(normal.getCharacterSet());
  const ink = rgb(0.12, 0.27, 0.2);
  let page;
  let y;

  function newPage() {
    page = pdf.addPage([595, 842]);
    y = 790;
  }

  function line(value, { font = normal, size = 11 } = {}) {
    const text = Array.from(String(value ?? '').replace(/\s+/g, ' '), character =>
      supported.has(character.codePointAt(0)) ? character : '?'
    ).join('');
    let row = '';
    for (const character of text) {
      if (font.widthOfTextAtSize(row + character, size) > 495) {
        draw(row);
        row = '';
      }
      row += character;
    }
    draw(row);

    function draw(value) {
      if (y < 55) newPage();
      page.drawText(value, { x: 50, y, size, font, color: ink });
      y -= size + 7;
    }
  }

  newPage();
  line('FreshNest', { font: bold, size: 23 });
  line('Order receipt', { font: bold, size: 17 });
  line('Order ' + order.id + '  |  ' + order.date);
  line('Order status: ' + order.status.replaceAll('_', ' '));
  line('Payment: ' + order.payment + '  |  ' + order.paymentStatus);
  line('Delivery address: ' + order.address);
  y -= 14;
  line('Items', { font: bold, size: 14 });
  for (const item of order.items) {
    line(item.name + ' x ' + item.qty + ' @ ' + amount(item.price) + ' = ' + amount(item.price * item.qty));
  }

  const bill = order.bill;
  y -= 12;
  if (bill) {
    line('Subtotal: ' + amount(bill.subtotal));
    if (bill.couponDiscount) line('Coupon discount: -' + amount(bill.couponDiscount));
    line('Delivery: ' + amount(bill.delivery));
    line('Handling: ' + amount(bill.handling));
    if (bill.smallCart) line('Small-cart fee: ' + amount(bill.smallCart));
    if (bill.giftFee) line('Gift packing: ' + amount(bill.giftFee));
    if (bill.tip) line('Tip: ' + amount(bill.tip));
  }
  line('Order total: ' + amount(order.total), { font: bold, size: 14 });
  line('Issued as an order receipt for your records.');
  return pdf.save();
}

export async function downloadOrderReceipt(order) {
  const bytes = await createOrderReceipt(order);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'FreshNest-' + order.id + '-receipt.pdf';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
