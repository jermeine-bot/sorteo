export const generateTicketCode = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `VNT-${randomNum}`;
};
