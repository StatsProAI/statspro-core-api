import { Module } from '@nestjs/common';
import { AuroraService } from './aurora.service';
import { HttpModule } from '../common/http/http.module';

@Module({
  imports: [HttpModule],
  providers: [AuroraService],
  exports: [AuroraService],
})
export class AuroraModule {}
