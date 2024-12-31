    seenMessage: (req, res, next) => {
        try {
            const messageId = req.params.id;
            const userRecieveId = req.auth.userId;

            console.log("messageId", messageId);

            const param = { userRecieveId, messageId };

            messageService
                .seenMessage(param)
                .then((response) => {
                    res.status(200).json({
                        success: response.success,
                        message: response.message,
                    });
                })
                .catch((error) => {
                    console.log("errrrrrrrrrrr", error);
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    },