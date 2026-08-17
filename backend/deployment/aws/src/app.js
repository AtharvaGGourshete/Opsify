export const handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Opsify AWS SAM deployment works!"
    })
  };
};