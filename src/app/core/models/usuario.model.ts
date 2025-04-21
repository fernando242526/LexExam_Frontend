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
  id: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  username: string;
  rol: RolUsuario;
  activo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para crear un nuevo usuario
 */
export interface CreateUsuarioDto {
  nombre: string;
  apellidos: string;
  email: string;
  username: string;
  password: string;
  rol?: RolUsuario;
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUsuarioDto {
  nombre?: string;
  apellidos?: string;
  rol?: RolUsuario;
}
