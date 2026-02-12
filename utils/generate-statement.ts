import { Customer, TransactionWithProducts } from '@/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Linking } from 'react-native';

// Type for the translation function
type TranslateFn = (section: string, key: string, params?: Record<string, string | number>) => string;

// ──── PDF HTML Template ────

const generateHTML = (
  customer: Customer,
  transactions: TransactionWithProducts[],
  t: TranslateFn
): string => {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate totals
  const totalPurchases = transactions
    .filter((txn) => txn.type === 'purchase')
    .reduce((sum, txn) => sum + txn.amount, 0);
  const totalPayments = transactions
    .filter((txn) => txn.type === 'payment')
    .reduce((sum, txn) => sum + txn.amount, 0);

  // Build transaction rows
  const transactionRows = transactions
    .map((txn) => {
      const date = new Date(txn.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      });

      if (txn.type === 'payment') {
        return `
          <tr class="payment-row">
            <td>${date}</td>
            <td>${t('pdf', 'paymentReceived')}</td>
            <td></td>
            <td></td>
            <td class="payment">- ₹${txn.amount.toFixed(0)}</td>
          </tr>`;
      }

      // Purchase with product details
      const productLines = txn.products
        .map(
          (p) =>
            `<div class="product-line">
              <span class="product-name">${p.product_name}</span>
              ${p.quantity ? `<span class="product-qty">(${p.quantity})</span>` : ''}
              <span class="product-amt">₹${p.amount.toFixed(0)}</span>
            </div>`
        )
        .join('');

      return `
        <tr class="purchase-row">
          <td>${date}</td>
          <td>${txn.products.length > 0 ? txn.products.map((p) => p.product_name).join(', ') : t('pdf', 'purchase')}</td>
          <td class="products-detail">${productLines}</td>
          <td class="purchase">+ ₹${txn.amount.toFixed(0)}</td>
          <td></td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1E293B;
      background: #fff;
      padding: 24px;
      font-size: 13px;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #4A90D9, #3B7DD8);
      color: #fff;
      padding: 28px 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 22px;
      margin-bottom: 4px;
      letter-spacing: 1px;
    }
    .header .tagline {
      font-size: 11px;
      opacity: 0.7;
    }

    /* Customer Info */
    .customer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .customer-name {
      font-size: 18px;
      font-weight: 700;
    }
    .customer-phone {
      font-size: 12px;
      color: #64748B;
      margin-top: 2px;
    }
    .customer-date {
      font-size: 11px;
      color: #94A3B8;
      text-align: right;
    }

    /* Summary Cards */
    .summary {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .summary-card {
      flex: 1;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }
    .summary-card.purchases {
      background: #FEE2E2;
      border: 1px solid #FECACA;
    }
    .summary-card.payments {
      background: #DCFCE7;
      border: 1px solid #BBF7D0;
    }
    .summary-card.pending {
      background: ${customer.total_pending > 0 ? '#FEF3C7' : '#DCFCE7'};
      border: 1px solid ${customer.total_pending > 0 ? '#FDE68A' : '#BBF7D0'};
    }
    .summary-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #64748B;
      margin-bottom: 6px;
    }
    .summary-value {
      font-size: 20px;
      font-weight: 700;
    }
    .summary-card.purchases .summary-value { color: #E11D48; }
    .summary-card.payments .summary-value { color: #16A34A; }
    .summary-card.pending .summary-value { color: ${customer.total_pending > 0 ? '#D97706' : '#16A34A'}; }

    /* Table */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1E293B;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #4A90D9;
      display: inline-block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #F1F5F9;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 8px;
      text-align: left;
      border-bottom: 2px solid #E2E8F0;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: top;
      font-size: 12px;
    }
    .purchase { color: #E11D48; font-weight: 600; }
    .payment { color: #16A34A; font-weight: 600; }
    .payment-row { background: #F0FDF4; }

    .products-detail {
      font-size: 11px;
    }
    .product-line {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      gap: 8px;
    }
    .product-name { color: #475569; }
    .product-qty { color: #94A3B8; font-size: 10px; }
    .product-amt { color: #64748B; font-weight: 500; }

    /* Pending Banner */
    .pending-banner {
      background: ${customer.total_pending > 0 ? '#FEF3C7' : '#DCFCE7'};
      border: 2px solid ${customer.total_pending > 0 ? '#FDE68A' : '#BBF7D0'};
      border-radius: 10px;
      padding: 16px;
      text-align: center;
      margin-bottom: 20px;
    }
    .pending-banner .label {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .pending-banner .amount {
      font-size: 32px;
      font-weight: 800;
      color: ${customer.total_pending > 0 ? '#D97706' : '#16A34A'};
    }

    /* Footer */
    .footer {
      text-align: center;
      color: #94A3B8;
      font-size: 10px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      margin-top: 12px;
    }
    .footer .app-name {
      font-weight: 700;
      color: #4A90D9;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>📒 eKhata</h1>
    <div class="tagline">${t('pdf', 'accountStatement')}</div>
  </div>

  <!-- Customer Info -->
  <div class="customer-info">
    <div>
      <div class="customer-name">${customer.name}</div>
      ${customer.phone ? `<div class="customer-phone">📞 ${customer.phone}</div>` : ''}
    </div>
    <div class="customer-date">
      <div>${t('pdf', 'statementDate')}</div>
      <div style="font-weight:600; color:#1E293B;">${today}</div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary">
    <div class="summary-card purchases">
      <div class="summary-label">${t('pdf', 'totalPurchases')}</div>
      <div class="summary-value">₹${totalPurchases.toFixed(0)}</div>
    </div>
    <div class="summary-card payments">
      <div class="summary-label">${t('pdf', 'totalPayments')}</div>
      <div class="summary-value">₹${totalPayments.toFixed(0)}</div>
    </div>
    <div class="summary-card pending">
      <div class="summary-label">${t('pdf', 'pendingBalance')}</div>
      <div class="summary-value">₹${customer.total_pending.toFixed(0)}</div>
    </div>
  </div>

  <!-- Pending Banner -->
  <div class="pending-banner">
    <div class="label">${t('pdf', 'amountDue')}</div>
    <div class="amount">₹${customer.total_pending.toFixed(0)}</div>
  </div>

  <!-- Transaction Table -->
  <div class="section-title">${t('pdf', 'transactionHistory')} (${transactions.length})</div>
  ${
    transactions.length > 0
      ? `
    <table>
      <thead>
        <tr>
          <th>${t('pdf', 'date')}</th>
          <th>${t('pdf', 'description')}</th>
          <th>${t('pdf', 'items')}</th>
          <th>${t('pdf', 'purchase')}</th>
          <th>${t('pdf', 'payment')}</th>
        </tr>
      </thead>
      <tbody>
        ${transactionRows}
      </tbody>
      <tfoot>
        <tr style="border-top: 2px solid #E2E8F0; font-weight: 700;">
          <td colspan="3" style="text-align: right; padding-top: 12px;">${t('pdf', 'total')}</td>
          <td class="purchase" style="padding-top: 12px;">₹${totalPurchases.toFixed(0)}</td>
          <td class="payment" style="padding-top: 12px;">₹${totalPayments.toFixed(0)}</td>
        </tr>
      </tfoot>
    </table>`
      : '<p style="text-align:center; color:#94A3B8; padding:20px;">' + t('pdf', 'noTransactions') + '</p>'
  }

  <!-- Footer -->
  <div class="footer">
    ${t('pdf', 'generatedBy')} <span class="app-name">eKhata</span> ${t('pdf', 'on')} ${today}
  </div>
</body>
</html>`;
};

// ──── Generate & Share PDF ────

export const generateAndSharePDF = async (
  customer: Customer,
  transactions: TransactionWithProducts[],
  t: TranslateFn
): Promise<void> => {
  try {
    const html = generateHTML(customer, transactions, t);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(t('common', 'error'), t('whatsapp', 'errorMessage'));
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${customer.name} - ${t('pdf', 'accountStatement')}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    Alert.alert(t('common', 'error'), t('whatsapp', 'errorMessage'));
  }
};

// ──── WhatsApp Quick Reminder ────

export const sendWhatsAppReminder = (customer: Customer, t: TranslateFn): void => {
  if (!customer.phone) {
    Alert.alert(
      t('whatsapp', 'noPhoneTitle'),
      t('whatsapp', 'noPhoneMessage', { name: customer.name })
    );
    return;
  }

  // Clean phone number (remove spaces, dashes)
  const cleanPhone = customer.phone.replace(/[\s\-\(\)]/g, '');

  const message =
    `${t('whatsapp', 'greeting', { name: customer.name })}\n\n` +
    `${t('whatsapp', 'reminderBody', { amount: customer.total_pending.toFixed(0) })}\n\n` +
    `${t('whatsapp', 'pleaseCleared')}\n\n` +
    `${t('whatsapp', 'thanks')}\n` +
    `${t('whatsapp', 'signature')}`;

  const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback: try wa.me link
        Linking.openURL(
          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
        ).catch(() => {
          Alert.alert(t('whatsapp', 'notFoundTitle'), t('whatsapp', 'notFoundMessage'));
        });
      }
    })
    .catch(() => {
      Alert.alert(t('whatsapp', 'errorTitle'), t('whatsapp', 'errorMessage'));
    });
};
