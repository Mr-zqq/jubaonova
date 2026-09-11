import type { LoginAuthDto } from './dto/login-auth.dto'
import { AuthService } from './auth.service'
import { CaptchaService } from './captcha.service'
import { MenuService } from '@/modules/system/menu/menu.service'
import { UserService } from '@/modules/system/user/user.service'
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Headers,
  Req,
  Query,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '@/common/decorators'
import { ClientInfo } from '@/common/decorators/client-info.decorator'

@ApiTags('认证管理')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
    private readonly menuService: MenuService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Get('captcha')
  @ApiOperation({ summary: '获取验证码' })
  getCaptcha() {
    return this.captchaService.generateCaptcha()
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '用户登录' })
  login(@Body() loginAuthDto: LoginAuthDto, @ClientInfo() clientInfo) {
    return this.authService.login(loginAuthDto, clientInfo)
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  logout(@Headers('authorization') authorization: string) {
    // 提取Bearer token
    const token = authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error('未提供token')
    }
    return this.authService.logout(token)
  }

  @Public()
  @Post('refreshToken')
  @HttpCode(200)
  @ApiOperation({ summary: '刷新令牌' })
  refreshToken(
    @Body() updateToken: { refreshToken: string },
    @ClientInfo() clientInfo,
  ) {
    return this.authService.refreshToken(updateToken.refreshToken, clientInfo)
  }

  @Get('userInfo')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  getUserInfo(@Headers('authorization') authorization: string) {
    // 提取Bearer token
    const token = authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error('未提供token')
    }
    return this.authService.getUserInfo(token)
  }

  @Get('getUserRoutes')
  @ApiOperation({ summary: '获取全部路由（前端路由表）' })
  @ApiBearerAuth()
  getUserRoutes() {
    return this.menuService.findAllRoutes()
  }

  @Get('userPage')
  @ApiOperation({ summary: '用户分页（前端兼容）' })
  @ApiBearerAuth()
  async getUserPage(@Req() request: any, @Query() query: any) {
    const session = request.session
    const { list, total } = await this.userService.findAll(
      {
        pageNum: query.pageNum ? Number(query.pageNum) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
        username: query.username,
        phone: query.phone,
        status: query.status !== undefined ? Number(query.status) : undefined,
        deptId: query.deptId ? Number(query.deptId) : undefined,
      },
      session,
    )
    const listWithRoles = await Promise.all(
      list.map(async user => {
        const roles = await this.userService.findUserRoles(user.id)
        return {
          id: user.id,
          userName: user.username,
          nickname: user.nickName,
          email: user.email,
          tel: user.phone,
          gender:
            user.gender === 'male'
              ? 1
              : user.gender === 'female'
                ? 0
                : undefined,
          avatar: user.avatar,
          status: user.status === 0 ? 1 : 0,
          remark: user.remark,
          role: roles.map(item => item.id),
        }
      }),
    )
    return {
      list: listWithRoles,
      count: total,
    }
  }

  @Get('userMenu')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户菜单' })
  getUserMenu(@Headers('authorization') authorization: string) {
    // 提取Bearer token
    const token = authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error('未提供token')
    }
    return this.authService.getUserMenus(token)
  }
}
