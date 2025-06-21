interface CartItem {
  id: string
  product: {
    name: string
    price: number
    unit: string
    description?: string
    priceExclPPN?: number
  }
  generateImageToBase64: () => Promise<string>
  quantity: number
}

interface CustomerInfo {
  name?: string
  email?: string
  phone?: string
  address?: string
  company?: string
}

export const generateCartPDF = (
  items: any[],
  subtotal: number,
  ppn: number,
  total: number,
  logoBase64: string,
  customerInfo?: CustomerInfo
) => {
  // Helper
  const formatRupiah = (num: number) =>
    `Rp ${num.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const now = new Date()
  const tanggal = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const jam = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daftar Keranjang</title>
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
          width: 200px;
          height: 90px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo img {
          max-width: 200px;
          max-height: 150px;
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
        }
        .company-info h2 {
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
        .company-info .npwp {
          margin: 0 0 10px 0;
          font-size: 13px;
          font-weight: 500;
          font-family: Arial, sans-serif;
        }
        .separator {
          height: 2px;
          background-color: #222;
          margin: 32px 0 2rem 0;
        }
        .separator1 {
          height: 1px;
          background-color: #222;
          margin: 10px 0;
        }
        .judul {
          font-size: 18px;
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
        .download-date {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2rem;
          font-family: Arial, sans-serif;
        }
        .customer-info {
          margin: 2rem 0;
          font-size: 13px;
          font-family: Arial, sans-serif;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #2a1f9d;
        }
        .customer-info h3 {
          margin: 0 0 1rem 0;
          font-size: 14px;
          font-weight: bold;
          color: #2a1f9d;
        }
        .customer-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .customer-row {
          display: flex;
          align-items: flex-start;
        }
        .customer-row .label {
          width: 100px;
          font-weight: 600;
          color: #4a5568;
          flex-shrink: 0;
        }
        .customer-row .value {
          flex: 1;
          color: #2d3748;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          
          font-family: Arial, sans-serif;
        }
        thead th {
          font-weight: bold;
          text-transform: uppercase;
          color: #000;
          font-size: 12px;
          text-align: left;
          padding: 10px 10px;
          font-family: Arial, sans-serif;
          border-bottom: 1px solid #000;
          border-top: 1px solid #000;
        }
        tbody td {
          border: none;
          font-size: 13px;
          padding: 10px 10px;
          vertical-align: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          font-family: Arial, sans-serif;
        }
        tbody tr {
          border: none;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-red { color: #E53935; }
        .summary-table {
          width: 60%;
          margin-left: auto;
          margin-bottom: 0;
          margin-top: 5rem;
          font-family: Arial, sans-serif;
        }
        .summary-table td {
          border: none;
          padding: 4px 0 4px 0;
          font-size: 14px;
          font-family: Arial, sans-serif;
        }
        .summary-table .label {
          width: 60%;
          font-family: Arial, sans-serif;
        }
        
        .summary-table .value {
          width: 40%;
          text-align: right;
          font-family: Arial, sans-serif;
        }
        .summary-table .bold {
          font-weight: bold;
          font-family: Arial, sans-serif;
        }
        .summary-table .border-top {
          border-top: 1.5px solid #222;
          margin-top: 10px;
        }
        .summary-table .border-bottom {
          border-bottom: 1.5px solid #222;
        }
        .keterangan {
          font-size: 13px;
          margin-top: 32px;
          font-family: Arial, sans-serif;
        }
        @media print {
          body {
            background: #fff;
            font-family: Arial, sans-serif;
          }
          .container {
            box-shadow: none;
            font-family: Arial, sans-serif;
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
        <div class="judul">Daftar Keranjang</div>
        <div class="download-date">Diunduh Pada ${tanggal} ${jam}</div>
        
        ${
          customerInfo
            ? `
        <div class="customer-info">
          <h3>Informasi Pelanggan</h3>
          <div class="customer-details">
            ${
              customerInfo.name
                ? `
            <div class="customer-row">
              <span class="label">Nama</span>
              <span class="value">${customerInfo.name}</span>
            </div>
            `
                : ''
            }
            ${
              customerInfo.company
                ? `
            <div class="customer-row">
              <span class="label">Perusahaan</span>
              <span class="value">${customerInfo.company}</span>
            </div>
            `
                : ''
            }
            ${
              customerInfo.email
                ? `
            <div class="customer-row">
              <span class="label">Email</span>
              <span class="value">${customerInfo.email}</span>
            </div>
            `
                : ''
            }
            ${
              customerInfo.phone
                ? `
            <div class="customer-row">
              <span class="label">Telepon</span>
              <span class="value">${customerInfo.phone}</span>
            </div>
            `
                : ''
            }
            ${
              customerInfo.address
                ? `
            <div class="customer-row">
              <span class="label">Alamat</span>
              <span class="value">${customerInfo.address}</span>
            </div>
            `
                : ''
            }
          </div>
        </div>
        `
            : ''
        }
        
        <table>
          <thead>
            <tr>
              <th style="width:20%">Produk</th>
              <th style="width:7%; text-align: center;">UOM</th>
              <th style="width:7%; text-align: center;">Qty</th>
              <th style="width:10%; text-align: right;">Harga Satuan</th>
              <th style="width:10%; text-align: right;">Total Harga</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                <tr>
                  <td>
                    <div style="font-weight:600;font-family:Arial,sans-serif;color:#2a1f9d">${
                      item.product.name
                    }</div>
                    <div style="font-size:12px;color:#444;font-family:Arial,sans-serif;">${
                      item.product.sku || '-'
                    }</div>
                  </td>
                  <td class="text-center">${item.product.unit}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatRupiah(
                    item.product.price
                  )}</td>
                  <td class="text-right">${formatRupiah(
                    (item.product.priceExclPPN || item.product.price) *
                      item.quantity
                  )}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
        <table class="summary-table">
          <tbody>
            <tr>
              <td class="label">Subtotal</td>
              <td class="value">${formatRupiah(subtotal)}</td>
            </tr>
            <tr>
              <td class="label">PPN (11%)</td>
              <td class="value">${formatRupiah(ppn)}</td>
            </tr>
            <tr class="border-top border-bottom">
              <td class="label bold">Total</td>
              <td class="value bold">${formatRupiah(total)}</td>
            </tr>
          </tbody>
        </table>
        <div class="keterangan">
          <b>Keterangan</b><br/>
          1. Harga pada PDF ini hanya reference. Harga terupdate hanya pada website
        </div>
      </div>
      <script>window.print()</script>
    </body>
    </html>
  `
  return htmlContent
}
