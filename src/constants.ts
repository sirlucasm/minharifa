export const ERRORS = {
  accountAlreadyExists: {
    code: "auth/accountAlreadyExists",
    message: "Conta já pertence a um usuário",
  },
  accountIncorrectCredentials: {
    code: "auth/accountIncorrectCredentials",
    message: "Credenciais incorretas",
  },
  accountRegistrationFailed: {
    code: "auth/accountRegistrationFailed",
    message: "Falha ao tentar criar sua conta",
  },
  accountSignInFailed: {
    code: "auth/accountSignInFailed",
    message: "Falha ao tentar entrar na sua conta. Contate o suporte",
  },

  raffleShortNameExists: {
    code: "raffle/shortNameExists",
    message: "O nome curto informado já está em uso",
  },
  raffleNotFound: {
    code: "raffle/notFound",
    message: "A Rifa não foi encontrada",
  },
  raffleUserNumberAlreadyUsed: {
    code: "raffle/numberAlreadyUsed",
    message: "Número da rifa já está sendo utilizado",
  },
  raffleInviteAlreadySent: {
    code: "raffle/inviteAlreadySent",
    message: "Pedido de participação da Rifa já foi enviado",
  },

  event: {
    shortNameExists: {
      code: "event/shortNameExists",
      message: "O nome curto informado do evento já está em uso",
    },
    notFound: {
      code: "event/notFound",
      message: "O Evento não foi encontrado",
    },
    inviteAlreadySent: {
      code: "event/inviteAlreadySent",
      message: "Pedido de participação do evento já foi enviado",
    },
  },
  eventBudget: {
    notFound: {
      code: "eventBudget/notFound",
      message: "O orçamento não foi encontrado",
    },
  },
  eventGuest: {
    notFound: {
      code: "eventGuest/notFound",
      message: "O convidado não foi encontrado",
    },
  },
};

export const FIREBASE_ERRORS = {
  auth: ["auth/wrong-password", "auth/user-not-found"],
};
