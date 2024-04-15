import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HttpHealthIndicator } from '@nestjs/terminus';
import { BlockchainConnectorService } from '../tokens/blockchain.service';
import { getHttpRequestOptions } from '../utils';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private blockchain: BlockchainConnectorService,
  ) {}

  @Get('/liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('/readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => {
        const httpOptions = getHttpRequestOptions(
          this.blockchain.username,
          this.blockchain.password,
        );
        return this.http.pingCheck('ethconnect', `${this.blockchain.baseUrl}/status`, {
          auth: httpOptions.auth,
          httpsAgent: httpOptions.httpsAgent,
        });
      },
    ]);
  }
}