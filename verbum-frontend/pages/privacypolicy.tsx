import type { NextPage } from 'next'
import { Box, Center, Input, Container, Button, Heading, Text, UnorderedList, ListItem, Stack } from '@chakra-ui/react'
import Head from 'next/head';

const PrivacyPolicy: NextPage = () => {
    return (
        <Container maxW='container.lg' marginTop="1em">
            <Stack>
                <Head>
                    <title>Verbum.io | Privacy Policy</title>
                </Head>

                <Heading size="xl">Privacy Policy for Verbum.io</Heading>

                <Text>At Verbum.io, accessible from verbum.davidreis.me, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Verbum.io and how we use it.</Text>

                <Text>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</Text>

                <Text>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Verbum.io. This policy is not applicable to any information collected offline or via channels other than this website. Our Privacy Policy was created with the help of the <a href="https://www.privacypolicygenerator.info">Free Privacy Policy Generator</a>.</Text>

                <Heading size="md">Consent</Heading>

                <Text>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</Text>

                <Heading size="md">Information we collect</Heading>

                <Text>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</Text>
                <Text>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</Text>
                <Text>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</Text>

                <Heading size="md">How we use your information</Heading>

                <Text>We use the information we collect in various ways, including to:</Text>

                <UnorderedList>
                    <ListItem>Provide, operate, and maintain our website</ListItem>
                    <ListItem>Improve, personalize, and expand our website</ListItem>
                    <ListItem>Understand and analyze how you use our website</ListItem>
                    <ListItem>Develop new products, services, features, and functionality</ListItem>
                    <ListItem>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</ListItem>
                    <ListItem>Send you emails</ListItem>
                    <ListItem>Find and prevent fraud</ListItem>
                </UnorderedList>

                <Heading size="md">Log Files</Heading>


                <Heading size="md">Google DoubleClick DART Cookie</Heading>

                <Text>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a></Text>

                <Heading size="md">Advertising Partners Privacy Policies</Heading>

                <Text>You may consult this list to find the Privacy Policy for each of the advertising partners of Verbum.io.</Text>

                <Text>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Verbum.io, which are sent directly to users&apos; browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</Text>

                <Text>Note that Verbum.io has no access to or control over these cookies that are used by third-party advertisers.</Text>

                <Heading size="md">Third Party Privacy Policies</Heading>

                <Text>Verbum.io&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. </Text>

                <Text>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers&apos; respective websites.</Text>

                <Heading size="md">CCPA Privacy Rights (Do Not Sell My Personal Information)</Heading>

                <Text>Under the CCPA, among other rights, California consumers have the right to:</Text>
                <Text>Request that a business that collects a consumer&apos;s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</Text>
                <Text>Request that a business delete any personal data about the consumer that a business has collected.</Text>
                <Text>Request that a business that sells a consumer&apos;s personal data, not sell the consumer&apos;s personal data.</Text>
                <Text>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</Text>

                <Heading size="md">GDPR Data Protection Rights</Heading>

                <Text>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</Text>
                <Text>The right to access - You have the right to request copies of your personal data. We may charge you a small fee for this service.</Text>
                <Text>The right to rectification - You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</Text>
                <Text>The right to erasure - You have the right to request that we erase your personal data, under certain conditions.</Text>
                <Text>The right to restrict processing - You have the right to request that we restrict the processing of your personal data, under certain conditions.</Text>
                <Text>The right to object to processing - You have the right to object to our processing of your personal data, under certain conditions.</Text>
                <Text>The right to data portability - You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</Text>
                <Text>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</Text>

                <Heading size="md">Children&apos;s Information</Heading>

                <Text>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</Text>

                <Text>Verbum.io does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</Text>
            </Stack>

        </Container>
    );
}

export default PrivacyPolicy