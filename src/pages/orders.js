import React from 'react'
import Header from '../components/Header'
import { getSession, useSession } from 'next-auth/react'
import db from '../../firebase';
import moment from "moment"
import Order from '../components/Order';

function Orders({ orders }) {
    const { data: session } = useSession();

    return (
        <div>
            <Header />
            <main className="max-w-screen-lg mx-auto p-10">
                <h1 className="text-3xl border-b mb-2 pb-1 border-yellow-400">Your Orders</h1>
                {session ? (
                    <>
                        <h2>{orders.length} Orders</h2>
                        <div className="mt-5 space-y-4">
                            {orders?.map(({id, amount, amountShipping, items, timestamp, images}) => (
                                <Order 
                                    key={id}
                                    id={id}
                                    amount={amount}
                                    amountShipping={amountShipping}
                                    items={items}
                                    timestamp={timestamp}
                                    images={images}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <h2>Please sign in to see your orders</h2>
                )}
            </main>
        </div>
    );
}


export default Orders;

export async function getServerSideProps(context) {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    // Get the user's session
    const session = await getSession(context);

    // If there is no session, return early
    if (!session) {
        return {
            props: {}
        };
    }

    try {
        // Accessing Firestore to get the user's orders
        const stripeOrders = await db.collection('users').doc(session.user.email).collection('orders').orderBy('timestamp', 'desc').get();
        
        // Processing each order to structure the data as needed
        const orders = await Promise.all(
            stripeOrders.docs.map(async (order) => ({
                id: order.id,
                amount: order.data().amount,
                amountShipping: order.data().amount_shipping,
                images: order.data().images,
                timestamp: moment(order.data().timestamp.toDate()).unix(), // Converting Firestore Timestamp to UNIX timestamp
                items: (
                    await stripe.checkout.sessions.listLineItems(order.id, {
                        limit: 100
                    })
                ).data,
            }))
        );

        // Returning the orders in props for the page component
        return {
            props: {
                orders: orders,
            }
        };
    } catch (error) {
        console.error("Error fetching user orders: ", error);
        return {
            props: {}
        };
    }
}