/**
 * Enumeración de roles de usuarios
 */
export enum RolUsuario {
  ADMINISTRADOR = 'administrador',
  ABOGADO = 'abogado',
}

/**
 * Modelo para la entidad Usuario
 */
export interface Usuario {
  /** ID único del usuario */
  id: string;

  /** Nombre del usuario */
  nombre: string;

  /** Apellidos del usuario */
  apellidos: string;

  /** Nombre completo */
  nombreCompleto: string;

  /** Correo electrónico */
  email: string;

  /** Nombre de usuario */
  username: string;

  /** Rol del usuario */
  rol: RolUsuario;

  /** Indica si el usuario está activo */
  activo: boolean;

  /** Fecha de último inicio de sesión */
  ultimoLogin: Date | null;

  /** Fecha de creación del registro */
  createdAt: Date;

  /** Fecha de última actualización del registro */
  updatedAt: Date;
}

/**
 * DTO para crear un nuevo usuario
 */
export interface CreateUsuarioDto {
  /** Nombre del usuario */
  nombre: string;

  /** Apellidos del usuario */
  apellidos: string;

  /** Correo electrónico */
  email: string;

  /** Nombre de usuario */
  username: string;

  /** Contraseña */
  password: string;

  /** Rol del usuario (opcional) */
  rol?: RolUsuario;
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUsuarioDto {
  /** Nombre del usuario (opcional) */
  nombre?: string;

  /** Apellidos del usuario (opcional) */
  apellidos?: string;

  /** Rol del usuario (opcional) */
  rol?: RolUsuario;
}
