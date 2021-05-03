import {
  CognitoIdentityClient,
  ListIdentityPoolsCommand,
} from '@aws-sdk/client-cognito-identity';

import {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
  ListUserPoolClientsCommand,
  DescribeUserPoolClientCommand,
  DescribeUserPoolCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import { getDefaultRoleAssumerWithWebIdentity } from '@aws-sdk/client-sts';
import { fromTokenFile } from '@aws-sdk/credential-provider-web-identity';
import configure from '../amplify-config';
import Environment, { ssrGetCurrentEnvironment } from '../environment';

const getAuthenticationInfo = async () => {
  // if (
  //   store.getState().networkResources.auth.userPoolId
  //   || store.getState().networkResources.auth.identityPoolId
  // ) {
  //   return;
  // }

  let additionalClientParams = {};

  if (process.env.NODE_ENV !== 'development') {
    additionalClientParams = {
      ...additionalClientParams,
      credentials: fromTokenFile({
        roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(),
      }),
    };
  }

  const identityPoolClient = new CognitoIdentityClient(
    {
      region: 'eu-west-1',
      ...additionalClientParams,
    },
  );

  const userPoolClient = new CognitoIdentityProviderClient(
    {
      region: 'eu-west-1',
      ...additionalClientParams,
    },
  );

  const [{ IdentityPools }, { UserPools }] = await Promise.all([
    identityPoolClient.send(
      new ListIdentityPoolsCommand({ MaxResults: 60 }),
    ),
    userPoolClient.send(
      new ListUserPoolsCommand({ MaxResults: 60 }),
    ),
  ]);

  const sandboxId = process.env.SANDBOX_ID || 'default';

  /**
   * NOTE: if no environment is supplied (i.e. local development)
   * we are connecting to the staging Cognito environment. This is
   * because we do not have a way to reliably replicate Cognito in
   * local development.
   */
  const k8sEnv = process.env.K8S_ENV || 'staging';

  const identityPoolId = IdentityPools.find(
    (pool) => pool.IdentityPoolName.includes(sandboxId),
  ).IdentityPoolId;

  const userPoolId = UserPools.find((pool) => pool.Name.includes(k8sEnv)).Id;

  const { UserPoolClients } = await userPoolClient.send(
    new ListUserPoolClientsCommand({ UserPoolId: userPoolId, MaxResults: 60 }),
  );

  const userPoolClientId = UserPoolClients.find((client) => client.ClientName.includes(
    `${ssrGetCurrentEnvironment() !== Environment.DEVELOPMENT ? `cluster-${sandboxId}` : 'local'}`,
  )).ClientId;

  const [{ UserPoolClient: userPoolClientDetails }, { UserPool: { Domain } }] = await Promise.all([
    userPoolClient.send(
      new DescribeUserPoolClientCommand({ UserPoolId: userPoolId, ClientId: userPoolClientId }),
    ),
    userPoolClient.send(
      new DescribeUserPoolCommand({ UserPoolId: userPoolId }),
    ),
  ]);

  const amplifyConfig = configure(
    userPoolId,
    identityPoolId,
    { ...userPoolClientDetails, Domain: `${Domain}.auth.eu-west-1.amazoncognito.com` },
  );

  /*
    You can use this as a shim for authorization in the future:

    const { Auth } = withSSRContext(context);
    Auth.configure(amplifyConfig.Auth);
    const user = await Auth.currentAuthenticatedUser();
  */

  return {
    amplifyConfig,
  };
};

export default getAuthenticationInfo;
