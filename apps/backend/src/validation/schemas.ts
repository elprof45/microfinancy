import { z } from "zod";

/**
 * Enums for validation
 */
export const RoleEnum = z.enum(["ADMIN", "CAISSIER", "COLLECTEUR"]);
export const TypeMouvementEnum = z.enum(["VERSEMENT", "RETRAIT", "DEPOT"]);
export const StatutTransactionEnum = z.enum([
  "EN_ATTENTE",
  "VALIDE",
  "REJETE",
  "ANNULE",
  "REMBOURSE",
]);
export const TypeCompteEnum = z.enum([
  "EPARGNE",
  "COURANT",
  "ADC",
  "TONTINE",
]);

/**
 * Shared validation schemas
 */
export const PaginationSchema = z.object({
  skip: z.coerce.number().int().nonnegative().default(0),
  take: z.coerce.number().int().positive().default(20),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

/**
 * Authentication schemas
 */
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  nom: z.string().min(2, "Name must be at least 2 characters"),
  role: RoleEnum.default("CAISSIER"),
  agenceId: z.number().int().positive().optional(),
  societeId: z.number().int().positive().optional(),
  telephone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type PasswordResetRequestInput = z.infer<
  typeof PasswordResetRequestSchema
>;

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

/**
 * Utilisateur/User schemas
 */
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  nom: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  telephone: z.string().optional(),
  role: RoleEnum,
  agenceId: z.number().int().positive().optional(),
  societeId: z.number().int().positive().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  nom: z.string().min(2, "Name must be at least 2 characters").optional(),
  telephone: z.string().optional(),
  role: RoleEnum.optional(),
  agenceId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Societe (Society/Company) schemas
 */
export const CreateSocieteSchema = z.object({
  nom: z.string().min(2, "Name must be at least 2 characters"),
  raisonSociale: z.string().optional(),
  identifiant: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

export type CreateSocieteInput = z.infer<typeof CreateSocieteSchema>;

export const UpdateSocieteSchema = z.object({
  nom: z.string().min(2).optional(),
  raisonSociale: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSocieteInput = z.infer<typeof UpdateSocieteSchema>;

/**
 * Agence (Agency/Branch) schemas
 */
export const CreateAgenceSchema = z.object({
  code: z.string().min(1, "Code is required"),
  nom: z.string().min(2, "Name is required"),
  societeId: z.number().int().positive("Valid society ID required"),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  zoneId: z.number().int().optional(),
});

export type CreateAgenceInput = z.infer<typeof CreateAgenceSchema>;

export const UpdateAgenceSchema = z.object({
  nom: z.string().min(2).optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAgenceInput = z.infer<typeof UpdateAgenceSchema>;

/**
 * ClientTotine schemas
 */
export const CreateClientTotineSchema = z.object({
  numeroClient: z.string().min(1, "Client number is required"),
  nom: z.string().min(2, "Name is required"),
  agenceId: z.number().int().positive("Valid agency ID required"),
  agentCollecteurId: z.number().int().positive("Valid collector ID required"),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
});

export type CreateClientTotineInput = z.infer<typeof CreateClientTotineSchema>;

export const UpdateClientTotineSchema = z.object({
  nom: z.string().min(2).optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  agentCollecteurId: z.number().int().positive().optional(),
});

export type UpdateClientTotineInput = z.infer<typeof UpdateClientTotineSchema>;

/**
 * Compte (Account) schemas
 */
export const CreateCompteSchema = z.object({
  numeroCompte: z.string().min(1, "Account number is required"),
  typeCompte: TypeCompteEnum,
  clientId: z.number().int().positive().optional(),
  agenceId: z.number().int().positive("Valid agency ID required"),
  deviseId: z.string().default("XOF"),
});

export type CreateCompteInput = z.infer<typeof CreateCompteSchema>;

export const UpdateCompteSchema = z.object({
  solde: z.number().optional(),
  soldeDisponible: z.number().optional(),
  isActif: z.boolean().optional(),
});

export type UpdateCompteInput = z.infer<typeof UpdateCompteSchema>;

/**
 * Cotisation (Contribution/Savings) schemas
 */
export const CreateCotisationSchema = z.object({
  mois: z.string().min(1, "Month is required"),
  annee: z.number().int().positive("Valid year required"),
  mise: z.number().positive("Mise must be positive"),
  clientId: z.number().int().positive("Valid client ID required"),
  carnetId: z.number().int().positive("Valid passbook ID required"),
  agenceId: z.number().int().positive("Valid agency ID required"),
  agentCollecteurId: z.number().int().positive("Valid collector ID required"),
});

export type CreateCotisationInput = z.infer<typeof CreateCotisationSchema>;

export const UpdateCotisationSchema = z.object({
  mise: z.number().positive().optional(),
  isActif: z.boolean().optional(),
});

export type UpdateCotisationInput = z.infer<typeof UpdateCotisationSchema>;

/**
 * MouvementEpargne (Savings Movement) schemas
 */
export const CreateMouvementEpargneSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  type: TypeMouvementEnum,
  montant: z.number().positive("Amount must be positive"),
  agenceId: z.number().int().positive("Valid agency ID required"),
  clientId: z.number().int().positive().optional(),
  compteId: z.number().int().positive().optional(),
  creeParId: z.number().int().positive("Valid user ID required"),
  observations: z.string().optional(),
});

export type CreateMouvementEpargneInput = z.infer<
  typeof CreateMouvementEpargneSchema
>;

export const UpdateMouvementEpargneSchema = z.object({
  statut: StatutTransactionEnum.optional(),
  observations: z.string().optional(),
});

export type UpdateMouvementEpargneInput = z.infer<
  typeof UpdateMouvementEpargneSchema
>;

/**
 * Carnet (Passbook) schemas
 */
export const CreateCarnetSchema = z.object({
  numeroCarnet: z.string().min(1, "Passbook number is required"),
  clientTotineId: z.number().int().positive("Valid client ID required"),
  agentCollecteurId: z.number().int().positive("Valid collector ID required"),
});

export type CreateCarnetInput = z.infer<typeof CreateCarnetSchema>;

/**
 * MouvementTotine schemas
 */
export const CreateMouvementTotineSchema = z.object({
  jour: z.number().int().min(1).max(31),
  montant: z.number().positive("Amount must be positive"),
  carnetId: z.number().int().positive("Valid passbook ID required"),
  agenceId: z.number().int().positive().optional(),
  utilisateurId: z.number().int().positive().optional(),
  clientTotineId: z.number().int().positive().optional(),
});

export type CreateMouvementTotineInput = z.infer<
  typeof CreateMouvementTotineSchema
>;
