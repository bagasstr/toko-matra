const logoBase64 = process.env.NEXT_PUBLIC_LOGO_BASE64 ?? ''

export function generatePurchaseOrderPDF(
  items: any[],
  poNumber: string,
  poDate: string,
  customerName: string,
  customerCompany: string,
  customerAddress: string,
  customerCity: string,
  customerProvince: string,
  customerPostalCode: string,
  customerPhone: string,
  totalAmount: number,
  notes?: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pesanan Pembelian</title>
      <style>
        body {
          background: #f4f4f4;
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .container {
          background: #fff;
          max-width: 800px;
          margin: 20px auto;
          padding: 0 32px 24px 32px;
          font-family: Arial, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(147, 147, 147, 0.1);
          font-weight: bold;
          z-index: 0;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
        }
        .header-col {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-family: Arial, sans-serif;
          position: relative;
          z-index: 1;
        }
        .logo {
          width: 150px;
          height: 100px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo img {
          max-width: 150px;
          max-height: 100px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
          margin: auto;
        }
        .company-info {
          text-align: right;
          font-size: 14px;
          font-family: Arial, sans-serif;
          color: #1a202c;
        }
        .company-info h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: bold;
          font-family: Arial, sans-serif;
          color: #2d3748;
        }
        .separator {
          height: 2px;
          background-color: #222;
          margin: 32px 0 2rem 0;
        }
        .judul {
          font-size: 24px;
          font-weight: bold;
          font-family: Arial, sans-serif;
          color: #2d3748;
          text-align: center;
          margin-bottom: 20px;
        }
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
          font-family: Arial, sans-serif;
        }
        .info-block h3 {
          font-size: 14px;
          margin: 0 0 10px 0;
          font-weight: bold;
          color: #2d3748;
        }
        .info-block p {
          font-size: 13px;
          margin: 5px 0;
          color: #4a5568;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        th {
          background-color: #f7fafc;
          font-weight: bold;
          color: #2d3748;
          text-transform: uppercase;
        }
        td {
          color: #4a5568;
        }
        .total-section {
          margin-top: 20px;
          padding: 15px;
          background: #f8f8f8;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .total-row:last-child {
          border-bottom: none;
          font-weight: bold;
        }
        .notes {
          margin-top: 20px;
          padding: 15px;
          background: #f8f8f8;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        .notes h3 {
          font-size: 14px;
          margin: 0 0 10px 0;
          font-weight: bold;
          color: #2d3748;
        }
        .notes p {
          font-size: 13px;
          margin: 0;
          color: #4a5568;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 40px;
        }
        .signature-block {
          text-align: center;
        }
        .signature-line {
          width: 150px;
          border-top: 1px solid #000;
          margin: 40px auto 5px;
        }
        .signature-block p {
          margin: 5px 0;
          font-size: 13px;
          color: #4a5568;
        }
        @media print {
          body {
            background: #fff;
          }
          .container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="watermark">LUNAS</div>
        <div class="header-row">
          <div class="header-col">
            <div class="logo"><img src="${logoBase64}" alt="Logo" /></div>
            <div class="company-info">
              <h2>PT. Matra Kosala Digdaya</h2>
              <div>Jl. Raya Kb. Jeruk No.10 4, Kb. Jeruk<br/>Kota Jakarta Barat, DKI JAKARTA, 11530</div>
              <div>+62 856-9709-3044<br/>matrakosala@gmail.com</div>
            </div>
          </div>
          <div class="separator"/>
        </div>
        <div class="judul">PESANAN PEMBELIAN</div>
        <div style="font-size: 13px; color: #4a5568; margin-bottom: 20px; text-align: right;">
          <p>No. Pesanan: ${poNumber}</p>
          <p>Tanggal: ${poDate}</p>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>Penjual</h3>
            <p>PT. Matra Kosala Digdaya</p>
            <p>Jl. Raya Kb. Jeruk No.10 4, Kb. Jeruk</p>
            <p>Kota Jakarta Barat, DKI JAKARTA, 11530</p>
            <p>+62 856-9709-3044</p>
          </div>
          <div class="info-block">
            <h3>Pembeli</h3>
            <p>${customerCompany}</p>
            <p>${customerName}</p>
            <p>${customerAddress}</p>
            <p>${customerCity}, ${customerProvince} ${customerPostalCode}</p>
            <p>Telepon: ${customerPhone || '-'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">No</th>
              <th style="width: 40%;">Nama Barang</th>
              <th style="width: 15%; text-align: right;">Harga Satuan</th>
              <th style="width: 10%; text-align: center;">Jumlah</th>
              <th style="width: 10%; text-align: center;">Satuan</th>
              <th style="width: 20%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>
                  <div style="font-weight: 600; color: #2d3748;">${
                    item.product.name
                  }</div>
                  <div style="font-size: 12px; color: #718096;">${
                    item.product.sku || '-'
                  }</div>
                </td>
                <td style="text-align: right;">Rp ${item.price.toLocaleString(
                  'id-ID'
                )}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: center;">${item.product.unit}</td>
                <td style="text-align: right;">Rp ${(
                  item.price * item.quantity
                ).toLocaleString('id-ID')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>Rp ${totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div class="total-row">
            <span>PPN (11%)</span>
            <span>Rp ${Math.round(totalAmount * 0.11).toLocaleString(
              'id-ID'
            )}</span>
          </div>
          <div class="total-row">
            <span>Total Pembayaran</span>
            <span>Rp ${Math.round(totalAmount * 1.11).toLocaleString(
              'id-ID'
            )}</span>
          </div>
        </div>

        ${
          notes
            ? `
          <div class="notes">
            <h3>Catatan:</h3>
            <p>${notes}</p>
          </div>
        `
            : ''
        }

        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Disetujui oleh</p>
            <p style="font-weight: bold;">PT. Matra Kosala Digdaya</p>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Diterima oleh</p>
            <p style="font-weight: bold;">${customerName}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return htmlContent
}
