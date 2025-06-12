"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField } from "@/components/ui/form";
import PersonInfo from "./Person";
import { useMemo, useState } from "react";

export type TotalPayType = {
  username: string;
  total: string;
};

export const itemSchema = z.object({
  itemName: z.string().optional(),
  price: z.number().min(0, "Price must be at least 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const additionalFeeSchema = z.object({
  tax: z.number().positive().optional(),
  serviceTax: z.number().positive().optional(),
  deliveryFee: z.number().positive().optional(),
  roundingAdjustment: z.number().min(0).max(9).optional(),
  discount: z.number().min(0).max(100).optional(),
});

export const personSchema = z.object({
  username: z.string().min(1, "Username required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

export const formSchema = z.object({
  infos: z.array(personSchema).min(1, "At least one person is required"),
  additionalFees: additionalFeeSchema.optional(),
});

export type FormData = z.infer<typeof formSchema>;

export default function PaidForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      infos: [
        {
          username: "Person 1",
          items: [{ itemName: "", price: 0, quantity: 1 }],
        },
      ],
      additionalFees: {
        tax: 0,
        serviceTax: 0,
        deliveryFee: 0,
        roundingAdjustment: 0,
        discount: 0,
      },
    },
  });

  const [isClicked, setIsClicked] = useState({
    SSTTax: false,
    serviceTax: false,
    deliveryFee: false,
    roundingAdjustment: false,
    discount: false,
  });

  const [payPrice, setPayPrice] = useState<TotalPayType[]>([]);

  const infos = useWatch({
    control: form.control,
    name: "infos",
  });

  const subtotal = useMemo(() => {
    return infos?.reduce((personSum, person) => {
      const personTotal = person.items.reduce((itemSum, item) => {
        return itemSum + (item.price || 0) * (item.quantity || 0);
      }, 0);
      return personSum + personTotal;
    }, 0);
  }, [infos]);

  const tax = form.watch("additionalFees.tax") || 0;
  const serviceTax = form.watch("additionalFees.serviceTax") || 0;
  const deliveryFee = form.watch("additionalFees.deliveryFee") || 0;
  const roundingAdjustment =
    (form.watch("additionalFees.roundingAdjustment") || 0) / 100;
  const discount = form.watch("additionalFees.discount") || 0;

  function roundToNearest0_05(value: number): number {
    return Math.round(value * 20) / 20;
  }

  const totalPrice: number = useMemo(() => {
    let currentTotalPrice =
      subtotal +
      ((subtotal + deliveryFee) * tax) / 100 +
      ((subtotal + deliveryFee) * serviceTax) / 100 +
      deliveryFee;
    currentTotalPrice *= 1 - discount / 100;
    if (currentTotalPrice < 0) {
      return 0;
    }
    const roundedTotal = roundToNearest0_05(currentTotalPrice);
    const adjustment = roundedTotal - currentTotalPrice;
    if (adjustment > 0) {
      return currentTotalPrice + roundingAdjustment;
    } else {
      return currentTotalPrice - roundingAdjustment;
    }
  }, [tax, serviceTax, deliveryFee, roundingAdjustment, discount, subtotal]);

  const onSubmit = (data: FormData) => {
    setPayPrice([]);
    if (data.infos.length === 0) {
      return;
    }

    data.infos.forEach((person) => {
      const personTotal = person.items.reduce((itemSum, item) => {
        return itemSum + (item.price || 0) * (item.quantity || 0);
      }, 0);

      const deliveryFee = data.additionalFees?.deliveryFee ?? 0;
      const serviceTax = data.additionalFees?.serviceTax ?? 0;
      const tax = data.additionalFees?.tax ?? 0;
      const roundingAdjustment =
        (data.additionalFees?.roundingAdjustment ?? 0) / 100;

      let currentTotal = personTotal + deliveryFee / data.infos.length;
      let currentTotalWithTaxAndDiscount =
        currentTotal * (1 + (serviceTax + tax) / 100);
      const discount = data.additionalFees?.discount ?? 0;
      currentTotalWithTaxAndDiscount *= 1 - discount / 100;
      currentTotalWithTaxAndDiscount +=
        (currentTotalWithTaxAndDiscount / totalPrice) * roundingAdjustment;
      setPayPrice((prev) => [
        ...prev,
        {
          username: person.username,
          total: (isNaN(currentTotalWithTaxAndDiscount)
            ? 0
            : currentTotalWithTaxAndDiscount
          ).toFixed(2),
        },
      ]);
    });
  };

  const {
    fields: personFields,
    append: addPerson,
    remove: removePerson,
  } = useFieldArray({
    control: form.control,
    name: "infos",
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-4xl mx-auto p-2 sm:p-4">
            {personFields.map((person, personIndex) => (
              <PersonInfo
                key={person.id}
                person={person}
                personIndex={personIndex}
                form={form}
                removePerson={removePerson}
              />
            ))}

            <div className="mt-4 lg:mt-0 sm:p-4 max-w-sm mx-auto">
              <Button
                onClick={() =>
                  addPerson({
                    username: `Person ${personFields.length + 1}`,
                    items: [{ itemName: "", price: 0, quantity: 1 }],
                  })
                }
                className="w-full"
                type="button"
              >
                + Add Person
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-4 justify-end mt-8">
              <h2>Subtotal: </h2>
              <h1 className="text-2xl lg:text-4xl font-bold text-center sm:text-left">
                RM {subtotal.toFixed(2)}
              </h1>
            </div>
            <div className="mt-8 sm:mt-16 flex flex-row flex-wrap justify-center lg:gap-2 gap-4 items-center">
              <Button
                onClick={() => {
                  form.setValue("additionalFees.serviceTax", 0);
                  setIsClicked((prev) => ({
                    ...prev,
                    deliveryFee: !prev.deliveryFee,
                  }));
                }}
                variant={`${isClicked.deliveryFee ? "default" : "outline"}`}
                type="button"
                className="w-full sm:w-auto"
              >
                Delivery Fee
              </Button>
              <Button
                onClick={() => {
                  if (isClicked.SSTTax) {
                    form.setValue("additionalFees.tax", 0);
                  } else {
                    form.setValue("additionalFees.tax", 10);
                  }
                  setIsClicked((prev) => ({
                    ...prev,
                    SSTTax: !prev.SSTTax,
                  }));
                }}
                variant={`${isClicked.SSTTax ? "default" : "outline"}`}
                type="button"
                className="w-full sm:w-auto"
              >
                SST Tax
              </Button>
              <Button
                onClick={() => {
                  if (isClicked.serviceTax) {
                    form.setValue("additionalFees.serviceTax", 0);
                  } else {
                    form.setValue("additionalFees.serviceTax", 6);
                  }
                  setIsClicked((prev) => ({
                    ...prev,
                    serviceTax: !prev.serviceTax,
                  }));
                }}
                variant={`${isClicked.serviceTax ? "default" : "outline"}`}
                type="button"
                className="w-full sm:w-auto"
              >
                Service Tax
              </Button>

              <Button
                onClick={() => {
                  form.setValue("additionalFees.discount", 0);
                  setIsClicked((prev) => ({
                    ...prev,
                    discount: !prev.discount,
                  }));
                }}
                variant={`${isClicked.discount ? "default" : "outline"}`}
                type="button"
                className="w-full sm:w-auto"
              >
                Discount
              </Button>
              <Button
                onClick={() => {
                  form.setValue("additionalFees.roundingAdjustment", 0);
                  setIsClicked((prev) => ({
                    ...prev,
                    roundingAdjustment: !prev.roundingAdjustment,
                  }));
                }}
                variant={`${
                  isClicked.roundingAdjustment ? "default" : "outline"
                }`}
                type="button"
                className="w-full sm:w-auto"
              >
                Rounding Adjustment
              </Button>
            </div>
            <div className="flex justify-center mt-8">
              {(isClicked.SSTTax === true ||
                isClicked.deliveryFee === true ||
                isClicked.serviceTax === true ||
                isClicked.discount === true ||
                isClicked.roundingAdjustment === true) && (
                <Card className="w-full max-w-sm overflow-hidden">
                  <CardHeader className="text-center">
                    Additional Fees
                  </CardHeader>
                  <CardContent className="space-y-4 p-2 sm:p-4 ">
                    {isClicked.deliveryFee && (
                      <div className="grid grid-cols-3  items-center gap-2 sm:gap-4">
                        <div className="col-span-3 sm:col-span-1 flex  sm:justify-end">
                          <p>Delivery Fee:</p>
                        </div>
                        <div className="flex col-span-2 sm:col-span-1 items-center gap-2">
                          <p>RM</p>
                          <FormField
                            control={form.control}
                            name={`additionalFees.deliveryFee`}
                            render={({ field }) => (
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? 0
                                        : parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                        <div className="flex items-end sm:items-center ml-4 sm:ml-0 sm:mr-8">
                          RM {deliveryFee.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {isClicked.SSTTax && (
                      <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                        <div className="col-span-1 flex  sm:justify-end">
                          <p>SST Tax:</p>
                        </div>
                        <p className="text-right col-span-1 sm:text-left">
                          10%
                        </p>
                        <div className="flex items-end sm:items-center ml-4 sm:ml-0 sm:mr-8">
                          RM{" "}
                          {(((subtotal + deliveryFee) * tax) / 100).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {isClicked.serviceTax && (
                      <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                        <div className="col-span-1 flex  sm:justify-end">
                          <p>Service Tax:</p>
                        </div>
                        <p className="text-right col-span-1 sm:text-left">6%</p>
                        <div className="flex items-center ml-4 sm:ml-0 sm:mr-8">
                          {"RM "}
                          {(
                            ((subtotal + deliveryFee) * serviceTax) /
                            100
                          ).toFixed(2)}
                        </div>
                      </div>
                    )}

                    {isClicked.discount && (
                      <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                        <div className="col-span-3 sm:col-span-1 flex sm:justify-end">
                          <p>Discount:</p>
                        </div>
                        <div className="flex col-span-2 sm:col-span-1 items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`additionalFees.discount`}
                            render={({ field }) => (
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? 0
                                        : parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </FormControl>
                            )}
                          />
                          <p>%</p>
                        </div>

                        <div className="flex items-center ml-4 sm:ml-0 sm:mr-8">
                          {"RM "}
                          {(
                            ((subtotal + deliveryFee + serviceTax + tax) *
                              discount) /
                            100
                          ).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {isClicked.roundingAdjustment && (
                      <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                        <div className="col-span-3 sm:col-span-1 flex sm:justify-end">
                          <p className="sm:text-right">Rounding Adjustment:</p>
                        </div>
                        <div className="flex col-span-2 sm:col-span-1 items-center justify-end sm:justify-around ">
                          <p>RM 0.0</p>
                          <FormField
                            control={form.control}
                            name={`additionalFees.roundingAdjustment`}
                            render={({ field }) => (
                              <FormControl>
                                <Input
                                  className="w-10"
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? 0
                                        : parseInt(e.target.value)
                                    )
                                  }
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                        <div className="flex items-center ml-4 sm:ml-0 sm:mr-8">
                          {"RM "}
                          {roundingAdjustment.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-4 justify-end mt-8">
              <h2>Total Paid: </h2>
              <h1 className="text-2xl lg:text-4xl font-bold text-center sm:text-left">
                RM {totalPrice.toFixed(2)}
              </h1>
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Calculate
            </Button>
          </div>
        </form>
      </Form>
      <div>
        {payPrice.length > 0 && (
          <div className="mt-12 mb-20">
            <h1 className="text-2xl sm:text-4xl font-bold text-center sm:text-left">
              Total Amount to Pay
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              {payPrice.map((person, personIndex) => (
                <Card
                  key={personIndex}
                  className="flex items-center justify-between p-4"
                >
                  <CardContent className="flex flex-col justify-center">
                    <p className="font-bold">{person.username}</p>
                    <h1 className="text-2xl sm:text-4xl font-bold text-center sm:text-left">
                      RM {person.total}
                    </h1>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
