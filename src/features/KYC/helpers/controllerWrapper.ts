export const controllerWrapper = (fn: Function) => {
  return async (req: any, res: any) => {
    try {
      await fn(req, res);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
};
