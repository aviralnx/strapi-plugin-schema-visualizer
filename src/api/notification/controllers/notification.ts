module.exports = {
  async send(ctx) {
    try {
      const { body } = ctx.request;

      if (body?.event !== 'review-workflows.updateEntryStage') return ctx.body = { message: "Not a workflow update event" };

      const {
        from: { name: stageFromName = "", id: stageFromID = "" } = {},
        to: { name: stageToName = "", id: stageToID = "" } = {},
      } = body?.workflow?.stages || {};

      const { model, uid, entity } = body;
      const entityId = entity.id;

      const entryData = await strapi.documents(uid).findOne({
        documentId: entity.documentId,
        populate: "*",
      })
      const assigneeEmail = entryData?.strapi_assignee?.email;
      await strapi.plugins["email"].services.email.send({
        to: assigneeEmail,
        from: "aviral.swarnkar@successive.tech",
        replyTo: "aviral.swarnkar@successive.tech",
        subject: `Workflow stage updated: ${body.model}:- ${stageFromName} => ${stageToName}`,
        text: `The workflow stage for ${model} with ID ${entityId} has been updated from ${stageFromName} to ${stageToName}.`,
        html: `<p>The workflow stage for <strong>${model}</strong> with ID <strong>${entityId}</strong> has been updated:</p>
               <p>From: <strong>${stageFromName}</strong><br>
               To: <strong>${stageToName}</strong></p>`,
      });

      ctx.body = {
        message: "Notification sent successfully to assignee",
        assignee: assigneeEmail,
      };
    } catch (e) {
      console.log("Error while sending notification:", e);
      ctx.throw(500, e);
    }
  },
};
