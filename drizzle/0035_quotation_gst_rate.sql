-- Add GST rate snapshot on sales quotations (percent, e.g. 5.00)
ALTER TABLE sales_quotations
  ADD COLUMN IF NOT EXISTS tax_rate decimal(5, 2) DEFAULT 5;

COMMENT ON COLUMN sales_quotations.tax_rate IS 'GST percent applied to this quotation (snapshotted from ERP settings)';
COMMENT ON COLUMN sales_quotations.tax_amount IS 'GST amount in Nu. (subtotal × tax_rate / 100)';
