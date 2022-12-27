// Copyright © 2022 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Request, Response, NextFunction } from 'express';
import nanoid from 'nanoid';
import { FFRequestIDHeader } from './constants';

const ShortIDalphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
export const newReqId = nanoid.customAlphabet(ShortIDalphabet, 8);

export function requestIDMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.headers[FFRequestIDHeader]) {
    req.headers[FFRequestIDHeader] = newReqId();
  }
  next();
}
