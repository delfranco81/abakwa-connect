import { supabase } from "../../../../lib/supabase";
import type { Position } from "../types/position";

export async function getPositions(businessId: string) {
  return supabase
    .from("positions")
    .select("*")
    .eq("business_id", businessId)
    .order("title");
}

export async function createPosition(position: Partial<Position>) {
  return supabase
    .from("positions")
    .insert(position);
}

export async function updatePosition(
  id: string,
  position: Partial<Position>
) {
  return supabase
    .from("positions")
    .update(position)
    .eq("id", id);
}

export async function deletePosition(id: string) {
  return supabase
    .from("positions")
    .delete()
    .eq("id", id);
}
