"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from '@/hooks/useUser'
import { useState, useEffect } from "react"
import Image from "next/image"
import placeholder from "@/assets/images/placeholder.svg" 
import { captcha, register, sendCode, login } from "@/app/api"
import '@ant-design/v5-patch-for-react-19';
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { message } from 'antd'

import styles from "@/styles/login.module.scss"

function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const { setUserInfo } = useUser()

    // 验证码 SVG
    const [captchaSVG, setCaptchaSVG] = useState('');
    const [captchaKey, setCaptchaKey] = useState('');

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [userName, setUserName] = useState('')

    const [countdown, setCountdown] = useState(60);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const [captchaValue, setCaptchaValue] = useState('')
    const [sendCodeType,setSendCode] = useState('register')



    const submitLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {

            const response = await login({ email, password, captchaAnswer: captchaValue, captchaKey })
            // @ts-ignore
            if (response.success) {

                let token = response.data.token
                const { _id, uuId, userName, payTokenNumber, email } = response.data.user
                const userInfo = {
                    userId: _id,
                    uuId,
                    userName,
                    payTokenNumber,
                    email,
                    token
                }

                // 使用 zustand 存储用户数据
                setUserInfo(userInfo)
                // 跳转到主页
                window.location.href = '/dashboard';

            }

        } catch (error) {
            console.error('登录失败:', error);
        }


    }

    const sendEmailCaptcha = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {

            return;
        }

        try {
            setIsDisabled(true);
            setCountdown(60);

            // 倒计时
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsDisabled(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);

            // TODO: 连接服务器 - 发送邮箱验证码
            const result = await sendCode({ type:sendCodeType, email });
            // @ts-ignore
            if (result.success) { 
                message.success('验证码已发送到您的邮箱');
            }

        } catch (error) {
            setIsDisabled(false);
        }


    }

    /**
     * @description 获取验证码
     */
    const getCaptcha = async () => {
        try {
            // TODO: 连接服务器 - 调用获取验证码API
            const { data } = await captcha();
            setCaptchaKey(data.key);
            setCaptchaSVG(data.svg);

        } catch (error) {
            console.error('获取验证码失败:', error);
            toast.error('获取验证码失败，请重试');
        }
    }


    const registerSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            message.error ('两次密码输入不一致');
            return;
        }

        try {
            // TODO: 连接服务器 - 调用注册API
            const response = await register({ userName, email, password, emailCode: captchaValue });

            // @ts-ignore
            if (response.success) { 
                message.success('注册成功，请登录!');
               
                setUserName('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setCaptchaValue('')
                setCountdown(60);
                setIsDisabled(false);
                setCaptchaKey('')
                setCaptchaSVG('')


                 getCaptcha()

            }

        } catch (error) {
            console.error('注册失败:', error);
        }

    }

    const resetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    }

    useEffect(() => {
        setIsClient(false);
        getCaptcha()
    }, [])



    return (
        <div className={cn(styles.loginForm, className)} {...props}>
            <Card className={styles.card}>
                <CardContent className={styles.cardContent}>

                    <div className={styles.formSection}>
                        {
                            !isClient && (
                                <Tabs defaultValue="登录">
                                    <TabsList className={styles.tabsList}>
                                        <TabsTrigger value="登录">登录</TabsTrigger>
                                        <TabsTrigger value="注册">注册</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="登录">
                                        <form className={styles.form}>
                                            <div className={styles.formContent}>
                                                <div className={styles.header}>
                                                    <h1 className={styles.title}> 网文大神助手 </h1>
                                                    <p className={styles.subtitle}>
                                                        欢迎登录网文大神助手，请登录您的账号
                                                    </p>
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <Label htmlFor="email">邮箱</Label>
                                                    <Input id="email" type="email" value={email} 
                                                    
                                                    onChange={(e) => setEmail(e.target.value)} placeholder="请输入您的邮箱" required />
                                                </div>

                                                <div className={styles.inputGroup}>
                                                    <div className={styles.labelRow}>
                                                        <Label htmlFor="password">密码</Label>
                                                        <a href="#" className={styles.forgotPassword} > 忘记密码? </a>
                                                    </div>
                                                    <Input id="password" type="password" required value={password} 
                                                      placeholder="请输入密码"
                                                    onChange={(e) => setPassword(e.target.value)} />
                                                </div>


                                                <div className={styles.inputGroup}>

                                                    <div className={styles.captchaContainer}>

                                                        <Input id="captchaValue" required value={captchaValue} onChange={(e) => setCaptchaValue(e.target.value)} placeholder="请输入验证码" />

                                                        <div className={styles.captchaImageContainer}>
                                                            <div onClick={getCaptcha} className={styles.captchaImage} dangerouslySetInnerHTML={{ __html: captchaSVG }} />
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* type="submit" */}
                                                <Button className={styles.submitButton} onClick={submitLogin} > 登录 </Button>

                                                <div className={styles.centerText}>
                                                    忘记密码? &apos;
                                                    <a href="#" className={styles.linkText} onClick={() => {
                                                        
                                                        setSendCode('registerPassword')
                                                        setIsClient(true)
                                                        }}>
                                                        重置密码
                                                    </a>
                                                </div>



                                                <div className={styles.divider}>
                                                    <span className={styles.dividerText}>
                                                        Or continue with
                                                    </span>
                                                </div>

                                            </div>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="注册">
                                        <form className={styles.form}>

                                            <div className={styles.inputGroup}>
                                                <Label htmlFor="email">邮箱</Label>
                                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入您的邮箱" required />
                                            </div>

                                            <div className={styles.inputGroupMt}>
                                                <Label htmlFor="userName">用户名</Label>
                                                <Input id="userName" type="username" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="请输入您的用户名" required />
                                            </div>

                                            <div className={styles.inputGroupMt}>
                                                <div className={styles.labelRow}>
                                                    <Label htmlFor="password">密码</Label>
                                                </div>
                                                <Input id="password" type="password" required value={password} 
                                                   placeholder="请输入密码"
                                                onChange={(e) => setPassword(e.target.value)} />
                                            </div>

                                            <div className={styles.inputGroupMt}>
                                                <div className={styles.labelRow}>
                                                    <Label htmlFor="confirmPassword"> 确认密码 </Label>
                                                </div>
                                                <Input id="confirmPassword" type="confirmPassword" required value={confirmPassword} 
                                                  placeholder="请输入密码"
                                                onChange={(e) => setConfirmPassword(e.target.value)} />
                                            </div>

                                            <div  className={styles.inputGroupMt}>

                                                <div className={styles.captchaContainer}>

                                                    <Input id="captchaValue" required
                                                        value={captchaValue}
                                                        onChange={(e) => setCaptchaValue(e.target.value)} placeholder="请输入验证码" />

                                                    <div className={styles.captchaImageContainer}>
                                                        <Button 
                                                         style={{
                                                                borderRadius: '0.8rem',
                                                            }}
                                                        onClick={sendEmailCaptcha} disabled={isDisabled}>
                                                            {isClient && isDisabled ? `${countdown}秒后重试` : '获取验证码'}
                                                        </Button>
                                                    </div>

                                                </div>

                                            </div>

                                            <div 
                                            style={{
                                              marginTop:'2.5rem'
                                            }}
                                             >
                                                <Button className={styles.submitButton} onClick={registerSubmit} > 注册 </Button>
                                            </div>


                                            <div className={styles.divider} style={{

                                                marginTop:"2rem"
                                            }}>
                                            <span className={styles.dividerText}>
                                                Or continue with
                                            </span>
                                        </div>

                                        </form>
                                    </TabsContent>

                                </Tabs>
                            )
                        }

                        {
                            isClient && (
                                <div>
                                    <form className={styles.form}>

                                        <div className={styles.inputGroup}>
                                            <Label htmlFor="email">邮箱</Label>
                                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入您的邮箱" required />
                                        </div>

                                        <div className={styles.inputGroupMt}>
                                            <div className={styles.labelRow}>
                                                <Label htmlFor="password">密码</Label>
                                            </div>
                                            <Input id="password" type="password" required value={password} 
                                            placeholder="请输入密码"
                                            onChange={(e) => setPassword(e.target.value)} />
                                        </div>

                                        <div className={styles.inputGroupMt}>
                                            <div className={styles.labelRow}>
                                                <Label htmlFor="confirmPassword"> 确认密码 </Label>
                                            </div>
                                            <Input 
                                             placeholder="请输入确认密码"
                                            id="confirmPassword" type="confirmPassword" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                        </div>

                                        <div className={styles.inputGroupMt}>

                                            <div className={styles.captchaContainer}>

                                                <Input id="captchaValue" required value={captchaValue} onChange={(e) => setCaptchaValue(e.target.value)} placeholder="请输入验证码" />

                                                <div className={styles.captchaImageContainer}>
                                                    <Button 
                                                    style={{
                                                            borderRadius: '0.8rem',
                                                        }}
                                                    onClick={sendEmailCaptcha} disabled={isDisabled}>
                                                        {isClient && isDisabled ? `${countdown}秒后重试` : '获取验证码'}
                                                    </Button>
                                                </div>

                                            </div>

                                        </div>
                                        <div className="mt-10">
                                            <Button className={styles.submitButton} > 重置密码 </Button>
                                        </div>

                                        <div className={styles.centerText}>
                                            <a href="#" className={styles.linkText} onClick={() => {
                                                setSendCode('register')
                                                setIsClient(false)
                                            }}>
                                                返回登录
                                            </a>
                                        </div>

                                        <div className={styles.divider}>
                                            <span className={styles.dividerText}>
                                                Or continue with
                                            </span>
                                        </div>

                                    </form>
                                </div>
                            )
                        }
                    </div>


                    <div className="relative hidden bg-muted md:block">
                        {/*****************  登录背景 ****************/}
                        <Image alt="登录背景" src={placeholder} className="absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}


export default function LoginPage() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageContent}>
                <LoginForm />
            </div>
        </div>
    );
}