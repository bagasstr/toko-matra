interface FakturItem {
  id: string
  product: {
    name: string
    price: number
    unit: string
    sku?: string
    description?: string
  }
  quantity: number
}

export const generateFakturPDF = (
  items: FakturItem[],
  total: number,
  logoBase64: string,
  fakturNumber: string,
  fakturDate: string,
  customerName: string,
  customerCompany: string,
  customerLabelAddress: string,
  customerAddress: string,
  customerEmail?: string,
  customerPhone?: string,
  notes?: string
) => {
  const formatRupiah = (num: number) =>
    `Rp ${num.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const diskon = 0
  const ppn = Math.round((subtotal - diskon) * 0.11)
  const totalFaktur = subtotal + ppn - diskon

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice</title>
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
        .separator1 {
          height: 1px;
          background-color: #222;
          margin: 10px 0;
        }
        .judul {
          font-size: 18px;
          font-weight: bold;
          font-family: Arial, sans-serif;
          color: #2d3748;
        }
        .invoice-info {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 3rem;
          font-family: Arial, sans-serif;
          color: #4a5568;
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
          color: #2d3748;
          font-size: 12px;
          text-align: left;
          padding: 10px 10px;
          font-family: Arial, sans-serif;
          border-bottom: 1px solid #e2e8f0;
          border-top: 1px solid #e2e8f0;
          background-color: #f7fafc;
        }
        tbody td {
          border: none;
          font-size: 13px;
          padding: 10px 10px;
          vertical-align: center;
          border-bottom: 1px solid #e2e8f0;
          font-family: Arial, sans-serif;
          color: #4a5568;
        }
        tbody tr {
          border: none;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-red { color: #e53e3e; }
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
          color: #4a5568;
        }
        .summary-table .value {
          width: 40%;
          text-align: right;
          font-family: Arial, sans-serif;
          color: #2d3748;
        }
        .summary-table .bold {
          font-weight: bold;
          font-family: Arial, sans-serif;
          color: #2d3748;
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
          color: #4a5568;
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        .customer-info {
          margin: 2rem 0;
          font-size: 13px;
          font-family: Arial, sans-serif;
        }
        .customer-info h3 {
          margin: 0 0 1rem 0;
          font-size: 14px;
          font-weight: bold;
          color: #2d3748;
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
        .customer-row .address {
          line-height: 1.4;
          width: 100px;
          flex: 0 0 220px;
          overflow-wrap: break-word;
          word-wrap: break-word;
          color: #2d3748;
        }
        .product-name {
          font-weight: 600;
          font-family: Arial, sans-serif;
          color: #2d3748;
        }
        .product-sku {
          font-size: 12px;
          color: #718096;
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
        <div class="judul">Faktur</div>
        <div class="invoice-info">
          <div>Nomor Faktur: ${fakturNumber}</div>
          <div>Tanggal Faktur: ${fakturDate}</div>
        </div>

        <div class="customer-info">
          <h3>Informasi Pelanggan</h3>
          <div class="customer-details">
            <div class="customer-row">
              <span class="label">Nama</span>
              <span class="value">${customerName}</span>
            </div>
            <div class="customer-row">
              <span class="label">Perusahaan</span>
              <span class="value">${customerCompany || '-'}</span>
            </div>
            <div class="customer-row">
              <span class="label">Lokasi</span>
              <span class="value">${customerLabelAddress}</span>
            </div>
            <div class="customer-row">
              <span class="label">Alamat</span>
              <span class="value address">${customerAddress
                .split(',')
                .map((part) => part.trim())
                .join('\n')}</span>
            </div>
            <div class="customer-row">
              <span class="label">Email</span>
              <span class="value">${customerEmail || '-'}</span>
            </div>
            <div class="customer-row">
              <span class="label">Telepon</span>
              <span class="value">${customerPhone || '-'}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:20%">Produk</th>
              <th style="width:7%; text-align: center;">Satuan</th>
              <th style="width:7%; text-align: center;">Jumlah</th>
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
                  <div class="product-name">${item.product.name}</div>
                  <div class="product-sku">${item.product.sku || '-'}</div>
                </td>
                <td class="text-center">${item.product.unit}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatRupiah(item.product.price)}</td>
                <td class="text-right">${formatRupiah(
                  item.product.price * item.quantity
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
              <td class="label">Diskon</td>
              <td class="value text-red">- ${formatRupiah(diskon)}</td>
            </tr>
            <tr><td colspan="2"><div class="separator1"/></td></tr>
            <tr>
              <td class="label">Subtotal Setelah Diskon</td>
              <td class="value">${formatRupiah(subtotal - diskon)}</td>
            </tr>
            <tr>
              <td class="label">PPN (11%)</td>
              <td class="value">${formatRupiah(ppn)}</td>
            </tr>
            <tr class="border-top border-bottom">
              <td class="label bold">Total</td>
              <td class="value bold">${formatRupiah(totalFaktur)}</td>
            </tr>
          </tbody>
        </table>

        ${
          notes
            ? `
          <div class="keterangan">
            <b>Catatan Tambahan:</b><br/>
            ${notes}
          </div>
        `
            : ''
        }
      </div>
    </body>
    </html>
  `

  return htmlContent
}
