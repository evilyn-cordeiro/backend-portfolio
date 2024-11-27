import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!, // Coloque o URL do Supabase
  process.env.SUPABASE_KEY! // Coloque a chave da API do Supabase
);

export { supabase };
