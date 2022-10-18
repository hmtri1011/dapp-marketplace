import React, { useEffect } from 'react'
import { Button } from '@mantine/core'
import { useConnect, useAccount, useNetwork, useEnsName, useEnsAddress, useSwitchNetwork } from 'wagmi'
import { chainId } from 'config'

export interface WalletConnectProps {}

export const WalletConnect = ({}: WalletConnectProps) => {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { isConnected, address } = useAccount()
  const network = useNetwork()
  const ensName = useEnsName()
  const ensAddress = useEnsAddress()
  const { switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    if (isConnected) {
      if (network.chain?.id !== chainId) {
        switchNetwork?.(chainId)
      }
    }
  }, [isConnected, network.chain])

  const handleConnect = () => {
    connect({
      connector: connectors[0], // metamask
      chainId // goerli
    })
  }

  return (
    <div className='p-3'>
      <Button
        variant='filled'
        sx={theme => ({
          backgroundColor: `${theme.colors.pink[5]} !important`
        })}
        onClick={handleConnect}
      >
        Connect Wallet
      </Button>
    </div>
  )
}
