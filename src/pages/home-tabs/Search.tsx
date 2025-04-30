import { 
  IonButtons,
  IonContent, 
  IonHeader, 
  IonMenuButton, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonSearchbar,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient'; 

interface Product {
  id?: number;
  name: string;
  description: string;
  current_stock: number;
  arrived_stock: number;
  price: number; 
  batch_date: string;
  expiration_date: string;
  is_out_of_stock: boolean;
  created_at?: string;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch products when debounced term changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!debouncedTerm) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${debouncedTerm}%`); // Case-insensitive search

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedTerm]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Search Products</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonSearchbar 
          value={searchTerm}
          onIonChange={e => setSearchTerm(e.detail.value!)}
          placeholder="Search products..."
          animated
          debounce={300}
        />

        <IonLoading isOpen={loading} message="Searching..." />

        {products.length > 0 ? (
          <IonGrid>
            <IonRow>
              <IonCol size="2"><strong>Name</strong></IonCol>
              <IonCol size="2"><strong>Stock</strong></IonCol>
              <IonCol size="2"><strong>Price</strong></IonCol>
              <IonCol size="2"><strong>Batch Date</strong></IonCol>
              <IonCol size="2"><strong>Expiration</strong></IonCol>
              <IonCol size="2"><strong>Status</strong></IonCol>
            </IonRow>
            {products.map(product => (
              <IonRow key={product.id}>
                <IonCol size="2">{product.name}</IonCol>
                <IonCol size="2">
                  {product.current_stock}/{product.arrived_stock}
                </IonCol>
                <IonCol size="2">{formatCurrency(product.price)}</IonCol>
                <IonCol size="2">{new Date(product.batch_date).toLocaleDateString()}</IonCol>
                <IonCol size="2">{new Date(product.expiration_date).toLocaleDateString()}</IonCol>
                <IonCol size="2">
                  <IonBadge color={product.is_out_of_stock ? 'danger' : 'success'}>
                    {product.is_out_of_stock ? 'Out of Stock' : 'In Stock'}
                  </IonBadge>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        ) : (
          <IonItem lines="none">
            <IonLabel className="ion-text-center">
              {debouncedTerm ? 'No products found' : 'Enter a search term to find products'}
            </IonLabel>
          </IonItem>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Search;