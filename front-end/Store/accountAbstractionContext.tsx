

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ethers, utils } from 'ethers'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'

import AccountAbstraction from '@safe-global/account-abstraction-kit-poc'
import { Web3AuthModalPack } from '@safe-global/auth-kit'
import { GelatoRelayPack } from '@safe-global/relay-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'


import { initialChain } from '@/Chains/chains'
import usePolling from '@/Hooks/usePolling'
import Chain from '@/Models/chain'
import getChain from '@/Utils/getChain'

type accountAbstractionContextValue = {
    ownerAddress?: string
    chainId: string
    safes: string[]
    chain?: Chain
    isAuthenticated: boolean
    web3Provider?: ethers.providers.Web3Provider
    loginWeb3Auth: () => void
    logoutWeb3Auth: () => void
    setChainId: (chainId: string) => void
    safeSelected?: string
    safeBalance?: string
    setSafeSelected: React.Dispatch<React.SetStateAction<string>>
    isRelayerLoading: boolean
    relayTransaction: () => Promise<void>
    gelatoTaskId?: string
  }

const initialState = {
    isAuthenticated: false,
    loginWeb3Auth: () => {},
    logoutWeb3Auth: () => {},
    relayTransaction: async () => {},
    setChainId: () => {},
    setSafeSelected: () => {},
    safes: [],
    chainId: initialChain.id,
    isRelayerLoading: true,
}

const accountAbstractionContext = createContext<accountAbstractionContextValue>(initialState)

const useAccountAbstraction = () => {
    const context = useContext(accountAbstractionContext)
  
    if (!context) {
      throw new Error('useAccountAbstraction should be used within a AccountAbstraction Provider')
    }
  
    return context
}

const AccountAbstractionProvider = ({ children }: { children: JSX.Element }) => {
    const [ownerAddress, setOwnerAddress] = useState<string>('')
    const [safes, setSafes] = useState<string[]>([])
    const [chainId, setChainId] = useState<string>(() => {
        return initialChain.id
    })
    const [web3Provider, setWeb3Provider] = useState<ethers.providers.Web3Provider>()
    const isAuthenticated = !!ownerAddress && !!chainId
    //TODO: Chain setting needs to be built
    const chain = getChain(chainId) || initialChain


    // reset React state when you switch the chain
    useEffect(() => {
        setOwnerAddress('')
        setSafes([])
        setChainId(chain.id)
        setWeb3Provider(undefined)
        setSafeSelected('')
    }, [chain])

    // authClient
    const [web3AuthModalPack, setWeb3AuthModalPack] = useState<Web3AuthModalPack>()

    useEffect(() => {
        ;(async () => {
          console.log('Initializing web3AuthModalPack')
          const options: Web3AuthOptions = {
            //Start by hardcoding the Client_ID
            clientId: 'BIAPwXpPXnyYz3zp6wPkd_Zsb1J2Dxu-9jzhzV1FYp3ps2pz76XQvs6i-lGqZN_wrc1c-L2MAcJ7OaPw10nWsr0',
            web3AuthNetwork: 'testnet',
            chainConfig: {
              chainNamespace: CHAIN_NAMESPACES.EIP155,
              chainId: chain.id,
              rpcTarget: chain.rpcUrl
            },
            uiConfig: {
              theme: 'dark',
              loginMethodsOrder: ['google', 'facebook']
            }
          }
    
          const modalConfig = {
            [WALLET_ADAPTERS.TORUS_EVM]: {
              label: 'torus',
              showOnModal: false
            },
            [WALLET_ADAPTERS.METAMASK]: {
              label: 'metamask',
              showOnDesktop: true,
              showOnMobile: false
            }
          }
    
          const openloginAdapter = new OpenloginAdapter({
            loginSettings: {
              mfaLevel: 'mandatory'
            },
            adapterSettings: {
              uxMode: 'popup',
              whiteLabel: {
                name: 'Safe'
              }
            }
          })
          const web3AuthModalPack = new Web3AuthModalPack({})
    
          await web3AuthModalPack.init({
            options,
            adapters: [openloginAdapter],
            modalConfig
          })

          console.log('web3AuthModalPack initialized', web3AuthModalPack)
    
          setWeb3AuthModalPack(web3AuthModalPack)
        })()
    }, [chain])

    // auth-kit implementation
    const loginWeb3Auth = useCallback(async () => {
      console.log('loginWeb3Auth called')
        if (!web3AuthModalPack) return

        try {
          console.log('Attempting to sign in')
          const { safes, eoa } = await web3AuthModalPack.signIn()
          const provider = web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider
          console.log('Sign in successful', { safes, eoa, provider })

        // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
          setChainId(chain.id)
          setOwnerAddress(eoa)
          setSafes(safes || [])
          setWeb3Provider(new ethers.providers.Web3Provider(provider))
        } catch (error) {
          console.log('error: ', error)
        }
    }, [chain, web3AuthModalPack])

    useEffect(() => {
        if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
          console.log('web3AuthModalPack or its provider changed, calling loginWeb3Auth')
          ;(async () => {
            await loginWeb3Auth()
          })()
        }
      }, [web3AuthModalPack, loginWeb3Auth])

    const logoutWeb3Auth = () => {
        web3AuthModalPack?.signOut()
        setOwnerAddress('')
        setSafes([])
        setChainId(chain.id)
        setWeb3Provider(undefined)
        setSafeSelected('')
        setGelatoTaskId(undefined)
    }
    const [safeSelected, setSafeSelected] = useState<string>('')

    useEffect(() => {
        const getSafeAddress = async () => {
          if (web3Provider) {
            const signer = web3Provider.getSigner()
            const relayPack = new GelatoRelayPack()
            const safeAccountAbstraction = new AccountAbstraction(signer)
    
            await safeAccountAbstraction.init({ relayPack })
    
            const hasSafes = safes.length > 0
    
            const safeSelected = hasSafes ? safes[0] : await safeAccountAbstraction.getSafeAddress()
    
            setSafeSelected(safeSelected)
          }
        }
    
        getSafeAddress()
    }, [safes, web3Provider])

    const [isRelayerLoading, setIsRelayerLoading] = useState<boolean>(false)
    const [gelatoTaskId, setGelatoTaskId] = useState<string>()

    // refresh the Gelato task id
    useEffect(() => {
        setIsRelayerLoading(false)
        setGelatoTaskId(undefined)
    }, [chainId])

    // relay-kit implementation using Gelato
    const relayTransaction = async () => {
        if (web3Provider) {
        setIsRelayerLoading(true)

        const signer = web3Provider.getSigner()
        const relayPack = new GelatoRelayPack()
        const safeAccountAbstraction = new AccountAbstraction(signer)

        await safeAccountAbstraction.init({ relayPack })

        // we use a dump safe transfer as a demo transaction
        const dumpSafeTransafer: MetaTransactionData[] = [
            {
            to: safeSelected,
            data: '0x',
            value: ethers.utils.parseUnits('0.01', 'ether').toString(),
            operation: 0 // OperationType.Call,
            }
        ]

        const options: MetaTransactionOptions = {
            isSponsored: false,
            gasLimit: '600000', // in this alfa version we need to manually set the gas limit
            gasToken: ethers.constants.AddressZero // native token
        }

        const gelatoTaskId = await safeAccountAbstraction.relayTransaction(dumpSafeTransafer, options)

        setIsRelayerLoading(false)
        setGelatoTaskId(gelatoTaskId)
        }
    }

    const fetchSafeBalance = useCallback(async () => {
        const balance = await web3Provider?.getBalance(safeSelected)
    
        return balance?.toString()
    }, [web3Provider, safeSelected])

    const safeBalance = usePolling(fetchSafeBalance)

    const state = {
        ownerAddress,
        chainId,
        chain,
        safes,

        isAuthenticated,

        web3Provider,

        loginWeb3Auth,
        logoutWeb3Auth,

        setChainId,

        safeSelected,
        safeBalance,
        setSafeSelected,

        isRelayerLoading,
        relayTransaction,
        gelatoTaskId,
    }

    return (
        <accountAbstractionContext.Provider value={state}>
        {children}
        </accountAbstractionContext.Provider>
    )
}

export { useAccountAbstraction, AccountAbstractionProvider }