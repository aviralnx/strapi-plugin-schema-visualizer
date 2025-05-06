module.exports = {
  async send(ctx) {
    try {
      const { body } = ctx.request;
      console.debug('🚀 ~ send ~ body:', body)

      if (body?.event !== 'review-workflows.updateEntryStage') return ctx.body = { message: "Not a workflow update event" };

      const {
        from: { name: stageFromName = "", id: stageFromID = "" } = {},
        to: { name: stageToName = "", id: stageToID = "" } = {},
      } = body?.workflow?.stages || {};

      const { model, uid, entity } = body;
      const entityId = entity.id;
      const documentId = entity.documentId;
      const deeplinkUrl = `http://localhost:1337/admin/content-manager/collection-types/${uid}/${documentId}`;
      const entryData = await strapi.documents(uid).findOne({
        documentId: entity.documentId,
        populate: "*",
      });
      const assigneeEmail = entryData?.strapi_assignee?.email;
      if (stageToID === 7) {
        try {
          // Call the review API when stage ID is 7
          const axios = require('axios');
          
          // Extract the content data from entryData dynamically
          const content = {};
          
          // Copy all properties from entryData to content except internal or metadata fields
          Object.keys(entryData).forEach(key => {
            // Skip internal properties that typically start with underscore or are standard Strapi fields
            if (!key.startsWith('_') && 
                !['id', 'createdAt', 'updatedAt', 'publishedAt', 'strapi_assignee', 'locale', 'createdBy', 'updatedBy', 'localizations', 'strapi_stage'].includes(key)) {
              content[key] = entryData[key];
            }
          });
          console.debug('🚀 ~ send ~ content:', content)
          
          // Make the API call to the review service
          console.debug('SENDING TO REVIEW API=======================================');
          axios.post('http://localhost:3000/api/review/webhook', {
            event: "review.stage.changed",
            entry: {
              id: entityId,
              contentType: model,
              assigneeEmail,
              reviewWorkflow: {
                stage: {
                  id: stageToID,
                }
              },
              content,
              deeplinkUrl,
            }
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.debug('SENT TO REVIEW API=======================================');
        } catch (error) {
          console.error('Error calling review API:', error);
          // Continue with the notification even if the review API call fails
        }
      }
      
      await strapi.plugins["email"].services.email.send({
        to: assigneeEmail ?? 'aviral.swarnkar@successive.tech',
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
