import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'

// Register font
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf',
})

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 120,
    opacity: 0.1,
    color: '#939393',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2a1f9d',
  },
  companyAddress: {
    fontSize: 10,
    textAlign: 'right',
    lineHeight: 1.4,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2a1f9d',
  },
  downloadDate: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'right',
    color: '#666',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#000',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 8,
  },
  columnProduct: {
    width: '40%',
  },
  columnUom: {
    width: '15%',
    textAlign: 'center',
  },
  columnQty: {
    width: '15%',
    textAlign: 'center',
  },
  columnPrice: {
    width: '15%',
    textAlign: 'right',
  },
  columnTotal: {
    width: '15%',
    textAlign: 'right',
  },
  productName: {
    fontWeight: 'bold',
    color: '#2a1f9d',
  },
  productSku: {
    fontSize: 10,
    color: '#666',
  },
  summary: {
    width: '60%',
    marginLeft: 'auto',
    marginTop: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    width: '60%',
  },
  summaryValue: {
    width: '40%',
    textAlign: 'right',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 30,
    fontSize: 12,
  },
})

interface CartItem {
  product: {
    name: string
    price: number
    unit: string
    sku?: string
    priceExclPPN?: number
  }
  quantity: number
}

interface PdfDocumentProps {
  content: {
    items: CartItem[]
    subtotal: number
    ppn: number
    total: number
    logoBase64: string
    type?:
      | 'cart'
      | 'payment'
      | 'order-detail'
      | 'pro-invoice'
      | 'purchase-order'
    orderId?: string
    orderDate?: string
    customerName?: string
    customerCompany?: string
    customerAddress?: string
    customerEmail?: string
    customerPhone?: string
    customerInfo?: {
      name?: string
      email?: string
      phone?: string
      address?: string
      company?: string
    }
    notes?: string
    proInvoiceNumber?: string
    proInvoiceDate?: string
    customerTaxId?: string
    terms?: string
    poNumber?: string
    poDate?: string
    supplierName?: string
    supplierCompany?: string
    supplierAddress?: string
    supplierEmail?: string
    supplierPhone?: string
    supplierTaxId?: string
    deliveryAddress?: string
    deliveryDate?: string
    paymentTerms?: string
  }
}

const formatRupiah = (num: number) =>
  `Rp ${num.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export const PdfDocument = ({ content }: PdfDocumentProps) => {
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

  const getDocumentTitle = () => {
    switch (content.type) {
      case 'payment':
        return 'PROFORMA INVOICE'
      case 'order-detail':
        return 'FAKTUR'
      case 'pro-invoice':
        return 'PROFORMA INVOICE'
      case 'purchase-order':
        return 'PURCHASE ORDER'
      default:
        return 'DAFTAR KERANJANG'
    }
  }

  const getDocumentNumber = () => {
    switch (content.type) {
      case 'payment':
        return `PI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}${String(now.getDate()).padStart(2, '0')}-${String(
          now.getHours()
        ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
      case 'order-detail':
        return (
          content.orderId ||
          `FAK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
            2,
            '0'
          )}${String(now.getDate()).padStart(2, '0')}`
        )
      case 'pro-invoice':
        return (
          content.proInvoiceNumber ||
          `PI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
            2,
            '0'
          )}${String(now.getDate()).padStart(2, '0')}`
        )
      case 'purchase-order':
        return (
          content.poNumber ||
          `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
            2,
            '0'
          )}${String(now.getDate()).padStart(2, '0')}`
        )
      default:
        return `CART-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}${String(now.getDate()).padStart(2, '0')}`
    }
  }

  return (
    <Document
      title='PT Matra Kosala Digdaya - Dokumen Resmi'
      author='PT Matra Kosala Digdaya'
      subject='Dokumen Transaksi'
      keywords='matra kosala, building materials, ecommerce'
      creator='PT Matra Kosala Digdaya eCommerce System'
      producer='PT Matra Kosala Digdaya'>
      <Page size='A4' style={styles.page}>
        {content.type !== 'pro-invoice' &&
          content.type !== 'purchase-order' &&
          content.type !== 'cart' && (
            <Text style={styles.watermark}>LUNAS</Text>
          )}
        <View style={styles.container}>
          <View style={styles.header}>
            <Image src={content.logoBase64} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>PT. Matra Kosala Digdaya</Text>
              <Text style={styles.companyAddress}>
                Jl. Raya Kb. Jeruk No.10 4, Kb. Jeruk{'\n'}
                Kota Jakarta Barat, DKI JAKARTA, 11530{'\n'}
                +62 856-9709-3044{'\n'}
                matrakosala@gmail.com
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{getDocumentTitle()}</Text>

          {/* Document Info */}
          <View
            style={{
              marginBottom: 15,
              padding: 10,
              borderRadius: 4,
            }}>
            <Text style={{ fontSize: 11, marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold' }}>No: </Text>
              {getDocumentNumber()}
            </Text>
            <Text style={{ fontSize: 11, marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold' }}>Tanggal: </Text>
              {content.proInvoiceDate ||
                content.poDate ||
                content.orderDate ||
                tanggal}
            </Text>

            {/* Customer/Supplier Info */}
            {content.customerName && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {content.type === 'purchase-order'
                    ? 'Supplier: '
                    : 'Pelanggan: '}
                </Text>
                {content.customerName}
              </Text>
            )}
            {content.customerCompany && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Perusahaan: </Text>
                {content.customerCompany}
              </Text>
            )}
            {content.supplierName && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Supplier: </Text>
                {content.supplierName}
                {content.supplierCompany && ` (${content.supplierCompany})`}
              </Text>
            )}
            {(content.customerAddress || content.supplierAddress) && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Alamat: </Text>
                {content.customerAddress || content.supplierAddress}
              </Text>
            )}
            {(content.customerEmail || content.supplierEmail) && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Email: </Text>
                {content.customerEmail || content.supplierEmail}
              </Text>
            )}
            {(content.customerPhone || content.supplierPhone) && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Telepon: </Text>
                {content.customerPhone || content.supplierPhone}
              </Text>
            )}
            {(content.customerTaxId || content.supplierTaxId) && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>NPWP: </Text>
                {content.customerTaxId || content.supplierTaxId}
              </Text>
            )}

            {/* Customer Info from customerInfo object */}
            {content.customerInfo && (
              <>
                {content.customerInfo.name && (
                  <Text style={{ fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Nama: </Text>
                    {content.customerInfo.name}
                  </Text>
                )}
                {content.customerInfo.company && (
                  <Text style={{ fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Perusahaan: </Text>
                    {content.customerInfo.company}
                  </Text>
                )}
                {content.customerInfo.email && (
                  <Text style={{ fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Email: </Text>
                    {content.customerInfo.email}
                  </Text>
                )}
                {content.customerInfo.phone && (
                  <Text style={{ fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Telepon: </Text>
                    {content.customerInfo.phone}
                  </Text>
                )}
                {content.customerInfo.address && (
                  <Text style={{ fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: 'bold' }}>Alamat: </Text>
                    {content.customerInfo.address}
                  </Text>
                )}
              </>
            )}

            {content.deliveryAddress && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Alamat Pengiriman: </Text>
                {content.deliveryAddress}
              </Text>
            )}
            {content.deliveryDate && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Tanggal Pengiriman: </Text>
                {content.deliveryDate}
              </Text>
            )}
            {content.paymentTerms && (
              <Text style={{ fontSize: 11, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Syarat Pembayaran: </Text>
                {content.paymentTerms}
              </Text>
            )}
          </View>

          <Text style={styles.downloadDate}>
            Dicetak pada: {tanggal} pukul {jam}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.columnProduct}>Produk</Text>
              <Text style={styles.columnUom}>UOM</Text>
              <Text style={styles.columnQty}>Qty</Text>
              <Text style={styles.columnPrice}>Harga Satuan</Text>
              <Text style={styles.columnTotal}>Total Harga</Text>
            </View>

            {content.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.columnProduct}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productSku}>
                    {item.product.sku || '-'}
                  </Text>
                </View>
                <Text style={styles.columnUom}>{item.product.unit}</Text>
                <Text style={styles.columnQty}>{item.quantity}</Text>
                <Text style={styles.columnPrice}>
                  {formatRupiah(item.product.price)}
                </Text>
                <Text style={styles.columnTotal}>
                  {formatRupiah(
                    (item.product.priceExclPPN || item.product.price) *
                      item.quantity
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(content.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>PPN (11%)</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(content.ppn)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(content.total)}
              </Text>
            </View>
          </View>

          <View style={styles.notes}>
            {content.type === 'pro-invoice' && (
              <>
                <Text style={{ fontWeight: 'bold' }}>Keterangan</Text>
                <Text>
                  1. Harga pada PDF ini hanya reference. Harga terupdate hanya
                  pada website
                </Text>
                {content.notes && (
                  <Text style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>Catatan: </Text>
                    {content.notes}
                  </Text>
                )}
                {content.terms && (
                  <Text style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>
                      Syarat & Ketentuan:{' '}
                    </Text>
                    {content.terms}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
