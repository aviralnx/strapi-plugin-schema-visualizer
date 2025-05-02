export default ({ env }) => ({
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'aviral.swarnkar@successive.tech',
        defaultReplyTo: 'aviral.swarnkar@successive.tech',
        testAddress: 'aviral.swarnkar@successive.tech',
      },
    },
  },
});
