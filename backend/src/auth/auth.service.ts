import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔍 DEBUG: validateUser llamado con email:', email);
    
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('🔍 DEBUG: Usuario encontrado:', user ? 'SÍ' : 'NO');
    
    if (user) {
      console.log('🔍 DEBUG: Usuario ID:', user.id);
      console.log('🔍 DEBUG: Usuario email:', user.email);
      console.log('🔍 DEBUG: Usuario password hash:', user.password.substring(0, 20) + '...');
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log('🔍 DEBUG: Contraseña coincide:', passwordMatch ? 'SÍ' : 'NO');
      
      if (passwordMatch) {
        const { password: _, ...result } = user;
        console.log('🔍 DEBUG: Usuario validado exitosamente');
        return result;
      }
    }
    
    console.log('🔍 DEBUG: Usuario no validado, retornando null');
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
  
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user: {  // ← Esta estructura debe coincidir con tu interfaz User
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role // Asegúrate de que esto no sea undefined
      },
      token: this.jwtService.sign(payload)
    };
  }

  /* async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    console.log('LOGIN:', user.email, 'TOKEN:', token);

    return {
      user,
      token: this.jwtService.sign(payload),
    };
  } */

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email }
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' };
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    // Enviar email
    const emailSent = await this.emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name
    );

    if (!emailSent) {
      throw new Error('Error al enviar el email de recuperación');
    }

    return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Token inválido o expirado');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    // Actualizar contraseña y limpiar token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async validateUserByEmail(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
} 