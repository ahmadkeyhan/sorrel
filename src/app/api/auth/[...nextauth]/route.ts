import NextAuth, { type NextAuthOptions } from "next-auth"
import { authOptions } from "@/app/utils/authOtions"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         name: { label: "username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.name || !credentials?.password) {
//           return null
//         }

//         try {
//           await connectToDatabase()

//           // Find user and explicitly select password field
//           const user = await User.findOne({ name: credentials.name }).select("+password")

//           if (!user) {
//             return null
//           }

//           // Check if password matches
//           const isPasswordValid = await user.comparePassword(credentials.password)

//           if (!isPasswordValid) {
//             return null
//           }

//           // Return user without password
//           return {
//             id: user._id.toString(),
//             name: user.name,
//             // email: user.email,
//             role: user.role,
//           }
//         } catch (error) {
//           console.error("Authentication error:", error)
//           return null
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id
//         token.role = user.role
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string
//         session.user.role = token.role as string
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//  
// }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

