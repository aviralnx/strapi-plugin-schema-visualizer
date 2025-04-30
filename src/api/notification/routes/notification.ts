import { config } from "process";

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/notification/workflow/update',
      handler: 'notification.send',
      config: {
        auth: false,
      }
    },
  ],
};
