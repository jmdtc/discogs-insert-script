export const formatDate = function (date: string): Date | null {
  let result: Date | null;
  if (!date || date === "?" || date === "") {
    result = null;
  } else if (Number(date.slice(5, 7)) > 12) {
    result = new Date(date.slice(0, 4));
  } else if (date.length === 4) {
    result = new Date(date);
  } else if (date.slice(5, 7) === "00") {
    result = new Date(date.slice(0, 4));
  } else if (date.slice(8, 10) === "00") {
    result = new Date(date.slice(0, -3));
  } else {
    result = new Date(date);
  }

  if (result?.toString() === "Invalid Date") {
    return null;
  }

  return result;
};
