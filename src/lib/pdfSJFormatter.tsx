interface SuratJalanItem {
  id: string
  product: {
    name: string
    quantity: number
    unit: string
  }
}
const logoBase64 = process.env.NEXT_PUBLIC_LOGO_BASE64 ?? ''
export function generateSuratJalanPDF(
  items: any[],
  deliveryNumber: string,
  deliveryDate: string,
  customerName: string,
  customerLabelAddress: string,
  customerAddress: string,
  customerCity: string,
  customerProvince: string,
  customerPostalCode: string,
  customerPhone: string,
  driverName: string,
  vehicleNumber: string,
  logisticCompany: string,
  notes?: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Surat Jalan</title>
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
        }
        .header-col {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-family: Arial, sans-serif;
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
          font-size: 18px;
          font-weight: bold;
          font-family: Arial, sans-serif;
          color: #2d3748;
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
        .shipping-info {
          background: #f8f8f8;
          padding: 15px;
          border: 1px solid #e2e8f0;
          margin: 20px 0;
          border-radius: 4px;
        }
        .shipping-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .shipping-info-item p {
          margin: 2px 0;
          font-size: 13px;
          color: #4a5568;
        }
        .shipping-info-item p:first-child {
          font-weight: bold;
          color: #2d3748;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 10px;
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
        .signatures {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
        <div class="judul">Surat Jalan</div>
        <div style="font-size: 13px; color: #4a5568; margin-bottom: 20px;">
          No: ${deliveryNumber}
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>Pengirim</h3>
            <p>PT. Matra Kosala Digdaya</p>
            <p>Jl. Raya Kb. Jeruk No.10 4, Kb. Jeruk</p>
            <p>Kota Jakarta Barat, DKI JAKARTA, 11530</p>
            <p>+62 856-9709-3044</p>
          </div>
          <div class="info-block">
            <h3>Penerima</h3>
            <p>${customerName}</p>
            <p>${customerLabelAddress}</p>
            <p>${customerAddress}, ${customerCity}</p>
            <p>${customerProvince}, ${customerPostalCode}</p>
            <p>Telp: ${customerPhone || '-'}</p>
          </div>
        </div>

        <div class="shipping-info">
          <div class="shipping-info-grid">
            <div class="shipping-info-item">
              <p>Tanggal Kirim</p>
              <p>${deliveryDate}</p>
            </div>
            <div class="shipping-info-item">
              <p>No. Surat Jalan</p>
              <p>${deliveryNumber}</p>
            </div>
            <div class="shipping-info-item">
              <p>Ekspedisi</p>
              <p>${logisticCompany}</p>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">No</th>
              <th style="width: 45%;">Nama Barang</th>
              <th style="width: 15%; text-align: center;">Jumlah</th>
              <th style="width: 15%; text-align: center;">Satuan</th>
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
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: center;">${item.product.unit}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="shipping-info" style="margin-top: 30px;">
          <div class="shipping-info-grid">
            <div class="shipping-info-item">
              <p>Nama Pengemudi</p>
              <p>${driverName}</p>
            </div>
            <div class="shipping-info-item">
              <p>No. Kendaraan</p>
              <p>${vehicleNumber}</p>
            </div>
            <div class="shipping-info-item">
              <p>Perusahaan Logistik</p>
              <p>${logisticCompany}</p>
            </div>
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
            <p>Pengirim</p>
            <p style="font-weight: bold;">PT. Matra Kosala Digdaya</p>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Pengemudi</p>
            <p style="font-weight: bold;">${driverName}</p>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Penerima</p>
            <p style="font-weight: bold;">${customerName}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return htmlContent
}
