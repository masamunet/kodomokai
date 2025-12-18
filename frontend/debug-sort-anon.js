const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// USE ANON KEY this time
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.log('Env Url:', supabaseUrl);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSort() {
  const currentFiscalYear = 2025; // Hardcoded for test

  console.log('Fetching assignments for FY:', currentFiscalYear, 'using ANON key');

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
