const fs = require('fs');
const path = require('path');

const target = path.resolve('../vione_project/apps/vione_app_be/src/connect-app/network.controller.ts');
let content = fs.readFileSync(target, 'utf8');

if (!content.includes('getNetworkRoot')) {
  content = content.replace(
    "@Controller(['network', 'connect-app/network'])\n@UseGuards(JwtAuthGuard)\nexport class NetworkController {\n  constructor(private readonly connectAppService: ConnectAppService) {}",
    `@Controller(['network', 'connect-app/network'])
@UseGuards(JwtAuthGuard)
export class NetworkController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get()
  async getNetworkRoot(@Request() req, @Query('limit') limit?: string) {
    return this.connectAppService.listConnections(req.user.id);
  }`
  );
  fs.writeFileSync(target, content, 'utf8');
  console.log('Added root @Get() to network.controller.ts');
} else {
  console.log('Already has getNetworkRoot');
}
