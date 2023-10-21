// import ConnectedWalletLabel from '../connected-wallet-label/ConnectedWalletLabel'
// import SafeAccount from '../safe-account/SafeAccount'
import { useAccountAbstraction } from '@/Store/accountAbstractionContext'
import PrimaryButton from '../PrimaryButton/PrimaryButton'

const Login = () => {
    
    const { loginWeb3Auth, logoutWeb3Auth, isAuthenticated } = useAccountAbstraction()

    return (
        <>
            {isAuthenticated ? (
                <PrimaryButton onClick={logoutWeb3Auth}>
                    Disconnect
                </PrimaryButton>
            ) : (
                <PrimaryButton onClick={loginWeb3Auth}>
                    Connect
                </PrimaryButton>
            )}
        </>
    )
}

export default Login