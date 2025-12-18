
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://aeroulnejrgozqejmumk.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_ckkaNNk5HdTkUXUl2n68AQ_pQhBLowI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkData() {
  console.log('Checking profiles...');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) {
    console.error('Error fetching profiles:', pError);
  } else {
    console.log(`Found ${profiles.length} profiles.`);
  }

  console.log('Checking children...');
  const { data: children, error: cError } = await supabase.from('children').select('*');
  if (cError) {
    console.error('Error fetching children:', cError);
  } else {
    console.log(`Found ${children.length} children.`);
  }
}

checkData();
