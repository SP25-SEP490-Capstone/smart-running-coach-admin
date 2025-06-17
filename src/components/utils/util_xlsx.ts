import * as XLSX from 'xlsx';

export const exportToExcel = (data: any, fileName = 'export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const prepareUserDataForExport = (users: any) => {
  return users.map(user => ({
    'Name': user.name,
    'Email': user.email,
    'Role': user.UserRole?.map(ur => ur.Role.role_name).join(', ') || 'User',
    'Status': user.is_active ? 'Active' : 'Inactive',
    'Created Date': new Date(user.created_at).toLocaleString(),
    'Gender': user.gender,
    'Birth Date': user.birth_date ? new Date(user.birth_date).toLocaleDateString() : ''
  }));
};