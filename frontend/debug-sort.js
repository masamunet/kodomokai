const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSort() {
  const currentFiscalYear = 2025; // Assuming test year, or use logic to get it

  console.log('Fetching assignments for FY:', currentFiscalYear);

  const { data, error } = await supabase
      .from('officer_role_assignments')
      .select(`
          id,
          created_at,
          role:officer_roles(id, name, display_order)
      `)
      .eq('fiscal_year', currentFiscalYear)
      .order('role(display_order)', { ascending: true })
      .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- Result Order ---');
  data.forEach((item, index) => {
    const roleName = item.role ? item.role.name : 'Unknown';
    const displayOrder = item.role ? item.role.display_order : 'N/A';
    console.log(`${index + 1}. Role: ${roleName} (Order: ${displayOrder}), CreatedAt: ${item.created_at}`);
  });
}

checkSort();
