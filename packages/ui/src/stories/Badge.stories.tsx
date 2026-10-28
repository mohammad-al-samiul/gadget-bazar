import { Badge } from '../components/Badge';

export default {
  title: 'Primitives/Badge',
  component: Badge,
};

export const GenuineCertified = () => <Badge variant="genuine">১০০% আসল সার্টিফাইড</Badge>;

export const MOQIndicator = () => (
  <Badge variant="accent" dot>
    MOQ: ৫ পিস
  </Badge>
);

export const StatusBadges = () => (
  <div className="flex gap-2">
    <Badge variant="success" dot>
      স্টকে আছে
    </Badge>
    <Badge variant="warning" dot>
      স্টক সীমিত
    </Badge>
    <Badge variant="error" dot>
      স্টক আউট
    </Badge>
  </div>
);
