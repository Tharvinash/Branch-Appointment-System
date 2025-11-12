// Bay color mapping based on bay names
// Each bay name has a dedicated color for flow visualization

export const getBayColor = (bayName: string): string => {
  const colorMap: Record<string, string> = {
    "Surface Preparation (SP)": "#3B82F6", // Blue
    "Spray Booth (SB) & Colour Matching": "#10B981", // Green
    "Polishing (PL)": "#F59E0B", // Amber
    "Assembly/Disassembly (A/D)": "#8B5CF6", // Purple
    "Panel Beating (PB)": "#EF4444", // Red
    "Mechanical (MEC)": "#06B6D4", // Cyan
    "Windscreen (WS)": "#F97316", // Orange
    "Frame Alligner (FA)": "#EC4899", // Pink
    "QC": "#6366F1", // Indigo
  };

  return colorMap[bayName] || "#6B7280"; // Default gray
};

export const getBayColorClass = (bayName: string): string => {
  const classMap: Record<string, string> = {
    "Surface Preparation (SP)": "bg-blue-500",
    "Spray Booth (SB) & Colour Matching": "bg-green-500",
    "Polishing (PL)": "bg-amber-500",
    "Assembly/Disassembly (A/D)": "bg-purple-500",
    "Panel Beating (PB)": "bg-red-500",
    "Mechanical (MEC)": "bg-cyan-500",
    "Windscreen (WS)": "bg-orange-500",
    "Frame Alligner (FA)": "bg-pink-500",
    "QC": "bg-indigo-500",
  };

  return classMap[bayName] || "bg-gray-500";
};

