import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome back, {user?.name}!
                </h2>
                <p className="text-muted-foreground">
                    Here's what's happening with your laundry business today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Today's Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">24</p>
                        <CardDescription>+12% from yesterday</CardDescription>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pending Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">156</p>
                        <CardDescription>Items in progress</CardDescription>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Revenue Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">$1,247</p>
                        <CardDescription>+8% from yesterday</CardDescription>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded">
                                    <div>
                                        <p className="font-medium">Order #{1000 + i}</p>
                                        <p className="text-sm text-muted-foreground">Customer {i}</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                        In Progress
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                                <p className="font-medium text-foreground">New Order</p>
                                <p className="text-sm text-muted-foreground">Create a new laundry order</p>
                            </button>
                            <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                                <p className="font-medium text-foreground">Add Customer</p>
                                <p className="text-sm text-muted-foreground">Register a new customer</p>
                            </button>
                            <button className="w-full text-left p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                                <p className="font-medium text-foreground">View Reports</p>
                                <p className="text-sm text-muted-foreground">Check business analytics</p>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;